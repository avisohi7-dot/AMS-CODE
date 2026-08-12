import SwiftUI
import SwiftData

struct GoalsListView: View {
    @EnvironmentObject private var health: HealthKitManager
    @Environment(\.modelContext) private var modelContext
    @Query(filter: #Predicate<Goal> { !$0.isArchived }) private var goals: [Goal]
    @Query(sort: \GymSession.startDate, order: .reverse) private var sessions: [GymSession]
    @Query private var nutritionEntries: [NutritionEntry]
    @State private var showingNewGoal = false

    private var sessionsThisWeek: Int {
        let weekStart = Calendar.current.date(byAdding: .day, value: -7, to: .now) ?? .now
        return sessions.filter { $0.startDate >= weekStart }.count
    }

    private var proteinToday: Double {
        let start = Calendar.current.startOfDay(for: .now)
        return nutritionEntries.filter { $0.date >= start }.reduce(0) { $0 + $1.proteinG }
    }

    var body: some View {
        NavigationStack {
            List {
                ForEach(goals) { goal in
                    let progress = GoalProgressCalculator.progress(for: goal, health: health, sessionsThisWeek: sessionsThisWeek, proteinToday: proteinToday)
                    GoalProgressRow(goal: goal, progress: progress)
                        .listRowSeparator(.hidden)
                }
                .onDelete(perform: delete)
            }
            .listStyle(.plain)
            .overlay {
                if goals.isEmpty {
                    ContentUnavailableView("No Goals Yet", systemImage: "target", description: Text("Set a goal to start tracking progress."))
                }
            }
            .navigationTitle("Goals")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button { showingNewGoal = true } label: { Image(systemName: "plus") }
                }
            }
            .sheet(isPresented: $showingNewGoal) {
                NewGoalView()
            }
        }
    }

    private func delete(at offsets: IndexSet) {
        for index in offsets {
            modelContext.delete(goals[index])
        }
    }
}
