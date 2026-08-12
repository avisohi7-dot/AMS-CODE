import Foundation
import WatchConnectivity
import SwiftData

@MainActor
final class PhoneConnectivityManager: NSObject, ObservableObject, WCSessionDelegate {
    private let modelContext: ModelContext

    init(modelContext: ModelContext) {
        self.modelContext = modelContext
        super.init()
        if WCSession.isSupported() {
            WCSession.default.delegate = self
            WCSession.default.activate()
        }
    }

    nonisolated func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {}
    nonisolated func sessionDidBecomeInactive(_ session: WCSession) {}
    nonisolated func sessionDidDeactivate(_ session: WCSession) {
        WCSession.default.activate()
    }

    nonisolated func session(_ session: WCSession, didReceiveUserInfo userInfo: [String: Any]) {
        guard let data = userInfo["payload"] as? Data else { return }
        Task { @MainActor in
            self.handle(data: data)
        }
    }

    private func handle(data: Data) {
        guard let payload = try? JSONDecoder().decode(WorkoutSyncPayload.self, from: data) else { return }

        let session = GymSession(
            id: payload.id,
            startDate: payload.startDate,
            endDate: payload.endDate,
            activityName: payload.activityName,
            source: .watch,
            healthKitWorkoutUUID: payload.healthKitWorkoutUUID,
            notes: "Logged from Apple Watch"
        )
        modelContext.insert(session)

        let grouped = Dictionary(grouping: payload.sets, by: { $0.exerciseName })
        for (index, entry) in grouped.enumerated() {
            let exercise = ExerciseEntry(name: entry.key, order: index)
            exercise.session = session
            session.exerciseEntries.append(exercise)
            for setPayload in entry.value.sorted(by: { $0.timestamp < $1.timestamp }) {
                let set = SetEntry(reps: setPayload.reps, weightKg: setPayload.weightKg, timestamp: setPayload.timestamp)
                set.exercise = exercise
                exercise.sets.append(set)
            }
        }

        try? modelContext.save()
    }
}
