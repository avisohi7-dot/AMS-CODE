import Foundation
import HealthKit

enum ActivityCatalog {
    static let commonExercises: [String] = [
        "Bench Press", "Squat", "Deadlift", "Overhead Press", "Barbell Row",
        "Pull-Up", "Push-Up", "Lat Pulldown", "Leg Press", "Leg Curl",
        "Leg Extension", "Bicep Curl", "Tricep Pushdown", "Dumbbell Row",
        "Incline Bench Press", "Dip", "Plank", "Lunge", "Hip Thrust", "Shoulder Press"
    ]

    static let workoutTypes: [(name: String, type: HKWorkoutActivityType)] = [
        ("Strength Training", .traditionalStrengthTraining),
        ("Functional Training", .functionalStrengthTraining),
        ("HIIT", .highIntensityIntervalTraining),
        ("Running", .running),
        ("Cycling", .cycling),
        ("Rowing", .rowing),
        ("Walking", .walking),
        ("Yoga", .yoga)
    ]

    static func activityType(forName name: String) -> HKWorkoutActivityType {
        workoutTypes.first(where: { $0.name == name })?.type ?? .traditionalStrengthTraining
    }
}
