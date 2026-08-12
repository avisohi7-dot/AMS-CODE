import Foundation
import SwiftData

enum SessionSource: String, Codable, Hashable {
    case manual
    case watch
    case healthKit
}

enum GoalType: String, Codable, CaseIterable, Identifiable, Hashable {
    case bodyWeight
    case weeklyWorkouts
    case dailySteps
    case dailyActiveEnergy
    case dailyProtein
    case sleepHours

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .bodyWeight: return "Body Weight"
        case .weeklyWorkouts: return "Workouts per Week"
        case .dailySteps: return "Daily Steps"
        case .dailyActiveEnergy: return "Daily Active Energy"
        case .dailyProtein: return "Daily Protein"
        case .sleepHours: return "Sleep"
        }
    }

    var defaultUnit: String {
        switch self {
        case .bodyWeight: return "kg"
        case .weeklyWorkouts: return "workouts"
        case .dailySteps: return "steps"
        case .dailyActiveEnergy: return "kcal"
        case .dailyProtein: return "g"
        case .sleepHours: return "hr"
        }
    }
}

@Model
final class GymSession {
    var id: UUID
    var startDate: Date
    var endDate: Date?
    var activityName: String
    var source: SessionSource
    var healthKitWorkoutUUID: UUID?
    var notes: String

    @Relationship(deleteRule: .cascade, inverse: \ExerciseEntry.session)
    var exerciseEntries: [ExerciseEntry] = []

    init(
        id: UUID = UUID(),
        startDate: Date = .now,
        endDate: Date? = nil,
        activityName: String = "Strength Training",
        source: SessionSource = .manual,
        healthKitWorkoutUUID: UUID? = nil,
        notes: String = ""
    ) {
        self.id = id
        self.startDate = startDate
        self.endDate = endDate
        self.activityName = activityName
        self.source = source
        self.healthKitWorkoutUUID = healthKitWorkoutUUID
        self.notes = notes
    }

    var duration: TimeInterval {
        (endDate ?? .now).timeIntervalSince(startDate)
    }
}

@Model
final class ExerciseEntry {
    var id: UUID
    var name: String
    var order: Int
    var session: GymSession?

    @Relationship(deleteRule: .cascade, inverse: \SetEntry.exercise)
    var sets: [SetEntry] = []

    init(id: UUID = UUID(), name: String, order: Int = 0) {
        self.id = id
        self.name = name
        self.order = order
    }
}

@Model
final class SetEntry {
    var id: UUID
    var reps: Int
    var weightKg: Double
    var timestamp: Date
    var exercise: ExerciseEntry?

    init(id: UUID = UUID(), reps: Int, weightKg: Double, timestamp: Date = .now) {
        self.id = id
        self.reps = reps
        self.weightKg = weightKg
        self.timestamp = timestamp
    }
}

@Model
final class Goal {
    var id: UUID
    var title: String
    var type: GoalType
    var targetValue: Double
    var unit: String
    var startDate: Date
    var deadline: Date?
    var isArchived: Bool

    init(
        id: UUID = UUID(),
        title: String,
        type: GoalType,
        targetValue: Double,
        unit: String? = nil,
        startDate: Date = .now,
        deadline: Date? = nil,
        isArchived: Bool = false
    ) {
        self.id = id
        self.title = title
        self.type = type
        self.targetValue = targetValue
        self.unit = unit ?? type.defaultUnit
        self.startDate = startDate
        self.deadline = deadline
        self.isArchived = isArchived
    }
}

@Model
final class NutritionEntry {
    var id: UUID
    var date: Date
    var foodName: String
    var calories: Double
    var proteinG: Double
    var carbsG: Double
    var fatG: Double

    init(
        id: UUID = UUID(),
        date: Date = .now,
        foodName: String,
        calories: Double,
        proteinG: Double = 0,
        carbsG: Double = 0,
        fatG: Double = 0
    ) {
        self.id = id
        self.date = date
        self.foodName = foodName
        self.calories = calories
        self.proteinG = proteinG
        self.carbsG = carbsG
        self.fatG = fatG
    }
}
