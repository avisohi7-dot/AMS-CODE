import Foundation

struct WidgetTask: Codable {
    let title: String
    let priority: String
    let status: String
    let dueDate: String?
}

struct WidgetExercise: Codable {
    let name: String
    let sets: Int
    let reps: Int
    let weight: String
    let done: Bool
}

struct WidgetWorkout: Codable {
    let name: String
    let dayOfWeek: String
    let exercises: [WidgetExercise]
}

struct WidgetFoodItem: Codable {
    let name: String
    let calories: Int
    let done: Bool
}

struct WidgetMeal: Codable {
    let name: String
    let time: String
    let items: [WidgetFoodItem]
}

struct SecondBrainWidgetData: Codable {
    let generatedAt: String
    let tasksToday: [WidgetTask]
    let workoutToday: WidgetWorkout?
    let mealsToday: [WidgetMeal]
}

enum WidgetDataStore {
    // Written by the Second Brain OS Electron app to a plain (non-sandboxed) path.
    static func load() -> SecondBrainWidgetData? {
        let url = FileManager.default
            .homeDirectoryForCurrentUser
            .appendingPathComponent("Library/Application Support/SecondBrainOS/widget-data.json")
        guard let data = try? Data(contentsOf: url) else { return nil }
        return try? JSONDecoder().decode(SecondBrainWidgetData.self, from: data)
    }
}
