import Foundation

struct SetPayload: Codable, Identifiable, Hashable {
    var id: UUID = UUID()
    var exerciseName: String
    var reps: Int
    var weightKg: Double
    var timestamp: Date
}

struct WorkoutSyncPayload: Codable {
    var id: UUID
    var activityName: String
    var startDate: Date
    var endDate: Date
    var healthKitWorkoutUUID: UUID?
    var sets: [SetPayload]
}
