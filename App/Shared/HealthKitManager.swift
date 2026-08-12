import Foundation
import HealthKit

@MainActor
final class HealthKitManager: ObservableObject {
    static let shared = HealthKitManager()

    let store = HKHealthStore()

    @Published var isAuthorized = false
    @Published var todaySteps: Double = 0
    @Published var todayActiveEnergyKcal: Double = 0
    @Published var latestHeartRateBPM: Double?
    @Published var lastNightSleepHours: Double = 0
    @Published var latestWeightKg: Double?
    @Published var recentWorkouts: [HKWorkout] = []

    let stepType = HKObjectType.quantityType(forIdentifier: .stepCount)!
    let energyType = HKObjectType.quantityType(forIdentifier: .activeEnergyBurned)!
    let heartRateType = HKObjectType.quantityType(forIdentifier: .heartRate)!
    let weightType = HKObjectType.quantityType(forIdentifier: .bodyMass)!
    let sleepType = HKObjectType.categoryType(forIdentifier: .sleepAnalysis)!
    let workoutType = HKObjectType.workoutType()

    private init() {}

    var readTypes: Set<HKObjectType> {
        [stepType, energyType, heartRateType, weightType, sleepType, workoutType]
    }

    var shareTypes: Set<HKSampleType> {
        [workoutType]
    }

    func requestAuthorization() async {
        guard HKHealthStore.isHealthDataAvailable() else { return }
        do {
            try await store.requestAuthorization(toShare: shareTypes, read: readTypes)
            isAuthorized = true
            await refreshAll()
        } catch {
            print("HealthKit authorization failed: \(error)")
        }
    }

    func refreshAll() async {
        async let steps = fetchTodaySum(quantityType: stepType, unit: .count())
        async let energy = fetchTodaySum(quantityType: energyType, unit: .kilocalorie())
        async let heartRate = fetchLatestHeartRate()
        async let weight = fetchLatestWeight()
        async let sleep = fetchLastNightSleepHours()
        async let workouts = fetchRecentWorkouts()

        todaySteps = await steps
        todayActiveEnergyKcal = await energy
        latestHeartRateBPM = await heartRate
        latestWeightKg = await weight
        lastNightSleepHours = await sleep
        recentWorkouts = await workouts
    }

    func fetchTodaySum(quantityType: HKQuantityType, unit: HKUnit) async -> Double {
        let start = Calendar.current.startOfDay(for: .now)
        let predicate = HKQuery.predicateForSamples(withStart: start, end: .now)
        return await withCheckedContinuation { continuation in
            let query = HKStatisticsQuery(quantityType: quantityType, quantitySamplePredicate: predicate, options: .cumulativeSum) { _, stats, _ in
                continuation.resume(returning: stats?.sumQuantity()?.doubleValue(for: unit) ?? 0)
            }
            store.execute(query)
        }
    }

    func fetchLatestHeartRate() async -> Double? {
        await withCheckedContinuation { continuation in
            let sort = NSSortDescriptor(key: HKSampleSortIdentifierEndDate, ascending: false)
            let query = HKSampleQuery(sampleType: heartRateType, predicate: nil, limit: 1, sortDescriptors: [sort]) { _, samples, _ in
                let sample = samples?.first as? HKQuantitySample
                continuation.resume(returning: sample?.quantity.doubleValue(for: HKUnit.count().unitDivided(by: .minute())))
            }
            store.execute(query)
        }
    }

    func fetchLatestWeight() async -> Double? {
        await withCheckedContinuation { continuation in
            let sort = NSSortDescriptor(key: HKSampleSortIdentifierEndDate, ascending: false)
            let query = HKSampleQuery(sampleType: weightType, predicate: nil, limit: 1, sortDescriptors: [sort]) { _, samples, _ in
                let sample = samples?.first as? HKQuantitySample
                continuation.resume(returning: sample?.quantity.doubleValue(for: .gramUnit(with: .kilo)))
            }
            store.execute(query)
        }
    }

    func fetchLastNightSleepHours() async -> Double {
        let end = Date.now
        guard let start = Calendar.current.date(byAdding: .hour, value: -20, to: end) else { return 0 }
        let predicate = HKQuery.predicateForSamples(withStart: start, end: end)
        return await withCheckedContinuation { continuation in
            let query = HKSampleQuery(sampleType: sleepType, predicate: predicate, limit: HKObjectQueryNoLimit, sortDescriptors: nil) { _, samples, _ in
                let asleepValues: Set<Int> = [
                    HKCategoryValueSleepAnalysis.asleepCore.rawValue,
                    HKCategoryValueSleepAnalysis.asleepDeep.rawValue,
                    HKCategoryValueSleepAnalysis.asleepREM.rawValue,
                    HKCategoryValueSleepAnalysis.asleepUnspecified.rawValue
                ]
                let totalSeconds = (samples as? [HKCategorySample])?
                    .filter { asleepValues.contains($0.value) }
                    .reduce(0.0) { $0 + $1.endDate.timeIntervalSince($1.startDate) } ?? 0
                continuation.resume(returning: totalSeconds / 3600)
            }
            store.execute(query)
        }
    }

    func fetchRecentWorkouts(limit: Int = 20) async -> [HKWorkout] {
        await withCheckedContinuation { continuation in
            let sort = NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: false)
            let query = HKSampleQuery(sampleType: workoutType, predicate: nil, limit: limit, sortDescriptors: [sort]) { _, samples, _ in
                continuation.resume(returning: (samples as? [HKWorkout]) ?? [])
            }
            store.execute(query)
        }
    }

    @discardableResult
    func saveWorkout(activityType: HKWorkoutActivityType, start: Date, end: Date, energyKcal: Double?) async -> HKWorkout? {
        let configuration = HKWorkoutConfiguration()
        configuration.activityType = activityType

        var samples: [HKSample] = []
        if let energyKcal {
            let quantity = HKQuantity(unit: .kilocalorie(), doubleValue: energyKcal)
            samples.append(HKQuantitySample(type: energyType, quantity: quantity, start: start, end: end))
        }

        return await withCheckedContinuation { continuation in
            let builder = HKWorkoutBuilder(healthStore: store, configuration: configuration, device: .local())
            builder.beginCollection(withStart: start) { _, _ in
                builder.add(samples) { _, _ in
                    builder.endCollection(withEnd: end) { _, _ in
                        builder.finishWorkout { workout, _ in
                            continuation.resume(returning: workout)
                        }
                    }
                }
            }
        }
    }
}
