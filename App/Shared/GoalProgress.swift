import Foundation

struct GoalProgress {
    var current: Double
    var target: Double
    var unit: String

    var fraction: Double {
        guard target > 0 else { return 0 }
        return current / target
    }
}

@MainActor
enum GoalProgressCalculator {
    static func progress(for goal: Goal, health: HealthKitManager, sessionsThisWeek: Int, proteinToday: Double) -> GoalProgress {
        switch goal.type {
        case .bodyWeight:
            return GoalProgress(current: health.latestWeightKg ?? 0, target: goal.targetValue, unit: goal.unit)
        case .weeklyWorkouts:
            return GoalProgress(current: Double(sessionsThisWeek), target: goal.targetValue, unit: goal.unit)
        case .dailySteps:
            return GoalProgress(current: health.todaySteps, target: goal.targetValue, unit: goal.unit)
        case .dailyActiveEnergy:
            return GoalProgress(current: health.todayActiveEnergyKcal, target: goal.targetValue, unit: goal.unit)
        case .dailyProtein:
            return GoalProgress(current: proteinToday, target: goal.targetValue, unit: goal.unit)
        case .sleepHours:
            return GoalProgress(current: health.lastNightSleepHours, target: goal.targetValue, unit: goal.unit)
        }
    }
}
