import SwiftUI
import SwiftData

struct WorkoutsListView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \GymSession.startDate, order: .reverse) private var sessions: [GymSession]
    @State private var showingNewSession = false

    var body: some View {
        NavigationStack {
            List {
                ForEach(sessions) { session in
                    NavigationLink(value: session) {
                        WorkoutRow(session: session)
                    }
                }
                .onDelete(perform: delete)
            }
            .overlay {
                if sessions.isEmpty {
                    ContentUnavailableView("No Workouts", systemImage: "figure.strengthtraining.traditional", description: Text("Log a gym session or start one from your Apple Watch."))
                }
            }
            .navigationTitle("Workouts")
            .navigationDestination(for: GymSession.self) { session in
                WorkoutDetailView(session: session)
            }
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button { showingNewSession = true } label: {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $showingNewSession) {
                NewGymSessionView()
            }
        }
    }

    private func delete(at offsets: IndexSet) {
        for index in offsets {
            modelContext.delete(sessions[index])
        }
    }
}

struct WorkoutRow: View {
    var session: GymSession

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(session.activityName).font(.subheadline).bold()
                Text(session.startDate.formatted(date: .abbreviated, time: .shortened))
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            Spacer()
            VStack(alignment: .trailing, spacing: 4) {
                Text(formattedDuration(session.duration)).font(.caption).foregroundStyle(.secondary)
                if session.source != .manual {
                    Label(session.source == .watch ? "Watch" : "Health", systemImage: session.source == .watch ? "applewatch" : "heart.fill")
                        .font(.caption2)
                        .foregroundStyle(.tint)
                }
            }
        }
    }

    private func formattedDuration(_ interval: TimeInterval) -> String {
        "\(Int(interval / 60)) min"
    }
}
