import WidgetKit
import SwiftUI

private let brandAccent = Color(red: 0.82, green: 0.204, blue: 0.180) // #d1342e

struct SuccessPortalEntry: TimelineEntry {
    let date: Date
    let data: SuccessPortalWidgetData?
}

struct SuccessPortalProvider: TimelineProvider {
    func placeholder(in context: Context) -> SuccessPortalEntry {
        SuccessPortalEntry(date: Date(), data: nil)
    }

    func getSnapshot(in context: Context, completion: @escaping (SuccessPortalEntry) -> Void) {
        completion(SuccessPortalEntry(date: Date(), data: WidgetDataStore.load()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<SuccessPortalEntry>) -> Void) {
        let entry = SuccessPortalEntry(date: Date(), data: WidgetDataStore.load())
        let nextRefresh = Calendar.current.date(byAdding: .minute, value: 15, to: Date()) ?? Date().addingTimeInterval(900)
        completion(Timeline(entries: [entry], policy: .after(nextRefresh)))
    }
}

// MARK: - Today's Tasks

struct TasksWidgetView: View {
    var entry: SuccessPortalEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Today's Tasks")
                .font(.headline)
                .foregroundColor(brandAccent)
            if let tasks = entry.data?.tasksToday, !tasks.isEmpty {
                ForEach(Array(tasks.prefix(5).enumerated()), id: \.offset) { _, task in
                    HStack(alignment: .top, spacing: 6) {
                        Circle()
                            .fill(priorityColor(task.priority))
                            .frame(width: 6, height: 6)
                            .padding(.top, 5)
                        Text(task.title)
                            .font(.caption)
                            .lineLimit(1)
                    }
                }
            } else {
                Text("Nothing due today")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            Spacer()
        }
        .padding()
        .widgetURL(URL(string: "successportal://tasks"))
    }

    private func priorityColor(_ priority: String) -> Color {
        switch priority {
        case "high": return .red
        case "medium": return .orange
        default: return .gray
        }
    }
}

struct TasksWidget: Widget {
    let kind = "TasksWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: SuccessPortalProvider()) { entry in
            TasksWidgetView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("Today's Tasks")
        .description("Tasks due today from Success Portal.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

// MARK: - Today's Workout

struct WorkoutWidgetView: View {
    var entry: SuccessPortalEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            if let workout = entry.data?.workoutToday {
                Text(workout.name)
                    .font(.headline)
                    .foregroundColor(brandAccent)
                Text(workout.dayOfWeek)
                    .font(.caption2)
                    .foregroundColor(.secondary)
                ForEach(Array(workout.exercises.prefix(4).enumerated()), id: \.offset) { _, ex in
                    HStack {
                        Image(systemName: ex.done ? "checkmark.circle.fill" : "circle")
                            .foregroundColor(ex.done ? .green : .secondary)
                            .font(.caption2)
                        Text("\(ex.name) — \(ex.sets)×\(ex.reps)")
                            .font(.caption)
                            .lineLimit(1)
                    }
                }
            } else {
                Text("Rest Day")
                    .font(.headline)
                    .foregroundColor(brandAccent)
                Text("No workout scheduled today")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            Spacer()
        }
        .padding()
        .widgetURL(URL(string: "successportal://fitness"))
    }
}

struct WorkoutWidget: Widget {
    let kind = "WorkoutWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: SuccessPortalProvider()) { entry in
            WorkoutWidgetView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("Today's Workout")
        .description("Your gym plan for today from Success Portal.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

// MARK: - Today's Meals

struct MealsWidgetView: View {
    var entry: SuccessPortalEntry

    var totalCalories: Int {
        entry.data?.mealsToday.flatMap { $0.items }.reduce(0) { $0 + $1.calories } ?? 0
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Today's Meals")
                .font(.headline)
                .foregroundColor(brandAccent)
            if let meals = entry.data?.mealsToday, !meals.isEmpty {
                ForEach(Array(meals.enumerated()), id: \.offset) { _, meal in
                    HStack {
                        Text(meal.name)
                            .font(.caption)
                        Spacer()
                        Text("\(meal.items.reduce(0) { $0 + $1.calories }) kcal")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                }
                Divider()
                Text("\(totalCalories) kcal total")
                    .font(.caption2.bold())
            } else {
                Text("No meals planned")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            Spacer()
        }
        .padding()
        .widgetURL(URL(string: "successportal://fitness"))
    }
}

struct MealsWidget: Widget {
    let kind = "MealsWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: SuccessPortalProvider()) { entry in
            MealsWidgetView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("Today's Meals")
        .description("Your diet plan for today from Success Portal.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

@main
struct SuccessPortalWidgetBundle: WidgetBundle {
    var body: some Widget {
        TasksWidget()
        WorkoutWidget()
        MealsWidget()
    }
}
