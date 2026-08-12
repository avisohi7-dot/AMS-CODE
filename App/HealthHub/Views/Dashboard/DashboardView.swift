import SwiftUI
import SwiftData

struct DashboardView: View {
    @EnvironmentObject private var health: HealthKitManager
    @Query(sort: \GymSession.startDate, order: .reverse) private var sessions: [GymSession]
    @Query(filter: #Predicate<Goal> { !$0.isArchived }) private var goals: [Goal]
    @Query private var nutritionEntries: [NutritionEntry]

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
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    statsGrid
                    if !goals.isEmpty {
                        goalsSection
                    }
                    recentWorkoutsSection
                }
                .padding()
            }
            .navigationTitle("Dashboard")
            .navigationDestination(for: GymSession.self) { session in
                WorkoutDetailView(session: session)
            }
            .refreshable { await health.refreshAll() }
            .task { await health.refreshAll() }
        }
    }

    private var statsGrid: some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
            StatTile(title: "Steps", value: "\(Int(health.todaySteps))", systemImage: "figure.walk")
            StatTile(title: "Active Energy", value: "\(Int(health.todayActiveEnergyKcal)) kcal", systemImage: "flame.fill")
            StatTile(title: "Heart Rate", value: health.latestHeartRateBPM.map { "\(Int($0)) bpm" } ?? "—", systemImage: "heart.fill")
            StatTile(title: "Sleep", value: String(format: "%.1f hr", health.lastNightSleepHours), systemImage: "bed.double.fill")
            StatTile(title: "Weight", value: health.latestWeightKg.map { String(format: "%.1f kg", $0) } ?? "—", systemImage: "scalemass.fill")
            StatTile(title: "Workouts / wk", value: "\(sessionsThisWeek)", systemImage: "figure.strengthtraining.traditional")
        }
    }

    private var goalsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Goals").font(.headline)
            ForEach(goals) { goal in
                let progress = GoalProgressCalculator.progress(for: goal, health: health, sessionsThisWeek: sessionsThisWeek, proteinToday: proteinToday)
                GoalProgressRow(goal: goal, progress: progress)
            }
        }
    }

    private var recentWorkoutsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Recent Workouts").font(.headline)
            if sessions.isEmpty {
                Text("No workouts logged yet.").foregroundStyle(.secondary)
            } else {
                ForEach(sessions.prefix(5)) { session in
                    NavigationLink(value: session) {
                        WorkoutRow(session: session)
                    }
                }
            }
        }
    }
}

struct StatTile: View {
    var title: String
    var value: String
    var systemImage: String

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Image(systemName: systemImage).foregroundStyle(.tint)
            Text(value).font(.title2).bold()
            Text(title).font(.caption).foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 14))
    }
}

struct GoalProgressRow: View {
    var goal: Goal
    var progress: GoalProgress

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text(goal.title).font(.subheadline).bold()
                Spacer()
                Text("\(formatted(progress.current)) / \(formatted(progress.target)) \(goal.unit)")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            ProgressView(value: min(progress.fraction, 1.0))
        }
        .padding()
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 14))
    }

    private func formatted(_ value: Double) -> String {
        value.truncatingRemainder(dividingBy: 1) == 0 ? String(Int(value)) : String(format: "%.1f", value)
    }
}
