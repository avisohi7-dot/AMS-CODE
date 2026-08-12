import Foundation
import HealthKit

@MainActor
final class WorkoutManager: NSObject, ObservableObject {
    @Published var isRunning = false
    @Published var elapsedTime: TimeInterval = 0
    @Published var heartRate: Double = 0
    @Published var activeEnergyKcal: Double = 0
    @Published var loggedSets: [SetPayload] = []

    private var session: HKWorkoutSession?
    private var builder: HKLiveWorkoutBuilder?
    private var startDate: Date?
    private var activityName: String = "Strength Training"
    private var timer: Timer?

    private let store = HealthKitManager.shared.store
    private let heartRateType = HKObjectType.quantityType(forIdentifier: .heartRate)!
    private let energyQuantityType = HKObjectType.quantityType(forIdentifier: .activeEnergyBurned)!

    func start(activityName: String, activityType: HKWorkoutActivityType) {
        self.activityName = activityName
        let configuration = HKWorkoutConfiguration()
        configuration.activityType = activityType
        configuration.locationType = .indoor

        do {
            let session = try HKWorkoutSession(healthStore: store, configuration: configuration)
            let builder = session.associatedWorkoutBuilder()
            builder.dataSource = HKLiveWorkoutDataSource(healthStore: store, workoutConfiguration: configuration)

            session.delegate = self
            builder.delegate = self

            self.session = session
            self.builder = builder
            self.startDate = .now
            self.loggedSets = []

            session.startActivity(with: .now)
            builder.beginCollection(withStart: .now) { _, _ in }

            isRunning = true
            startTimer()
        } catch {
            print("Failed to start workout session: \(error)")
        }
    }

    func logSet(exerciseName: String, reps: Int, weightKg: Double) {
        loggedSets.append(SetPayload(exerciseName: exerciseName, reps: reps, weightKg: weightKg, timestamp: .now))
    }

    func end() async -> WorkoutSyncPayload? {
        guard let session, let builder, let startDate else { return nil }
        let endDate = Date.now

        session.end()
        stopTimer()

        return await withCheckedContinuation { continuation in
            builder.endCollection(withEnd: endDate) { [weak self] _, _ in
                builder.finishWorkout { workout, _ in
                    Task { @MainActor in
                        let payload = WorkoutSyncPayload(
                            id: UUID(),
                            activityName: self?.activityName ?? "Workout",
                            startDate: startDate,
                            endDate: endDate,
                            healthKitWorkoutUUID: workout?.uuid,
                            sets: self?.loggedSets ?? []
                        )
                        self?.isRunning = false
                        self?.reset()
                        continuation.resume(returning: payload)
                    }
                }
            }
        }
    }

    private func reset() {
        session = nil
        builder = nil
        startDate = nil
        elapsedTime = 0
        heartRate = 0
        activeEnergyKcal = 0
        loggedSets = []
    }

    private func startTimer() {
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { [weak self] _ in
            guard let self else { return }
            Task { @MainActor in
                guard let start = self.startDate else { return }
                self.elapsedTime = Date.now.timeIntervalSince(start)
            }
        }
    }

    private func stopTimer() {
        timer?.invalidate()
        timer = nil
    }
}

extension WorkoutManager: HKWorkoutSessionDelegate {
    nonisolated func workoutSession(_ workoutSession: HKWorkoutSession, didChangeTo toState: HKWorkoutSessionState, from fromState: HKWorkoutSessionState, date: Date) {}
    nonisolated func workoutSession(_ workoutSession: HKWorkoutSession, didFailWithError error: Error) {
        print("Workout session failed: \(error)")
    }
}

extension WorkoutManager: HKLiveWorkoutBuilderDelegate {
    nonisolated func workoutBuilderDidCollectEvent(_ workoutBuilder: HKLiveWorkoutBuilder) {}

    nonisolated func workoutBuilder(_ workoutBuilder: HKLiveWorkoutBuilder, didCollectDataOf collectedTypes: Set<HKSampleType>) {
        Task { @MainActor in
            for type in collectedTypes {
                guard let quantityType = type as? HKQuantityType,
                      let statistics = workoutBuilder.statistics(for: quantityType) else { continue }

                if quantityType == heartRateType {
                    let unit = HKUnit.count().unitDivided(by: .minute())
                    heartRate = statistics.mostRecentQuantity()?.doubleValue(for: unit) ?? heartRate
                } else if quantityType == energyQuantityType {
                    activeEnergyKcal = statistics.sumQuantity()?.doubleValue(for: .kilocalorie()) ?? activeEnergyKcal
                }
            }
        }
    }
}
