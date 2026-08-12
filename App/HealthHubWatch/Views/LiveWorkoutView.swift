import SwiftUI

struct LiveWorkoutView: View {
    @EnvironmentObject private var workoutManager: WorkoutManager
    @EnvironmentObject private var connectivity: WatchConnectivityManager
    @State private var showingLogSet = false
    @State private var showingSummary = false
    @State private var summaryPayload: WorkoutSyncPayload?

    var body: some View {
        ScrollView {
            VStack(spacing: 12) {
                Text(formattedTime(workoutManager.elapsedTime))
                    .font(.system(size: 36, weight: .semibold, design: .rounded))
                HStack {
                    Label("\(Int(workoutManager.heartRate))", systemImage: "heart.fill")
                    Spacer()
                    Label("\(Int(workoutManager.activeEnergyKcal)) kcal", systemImage: "flame.fill")
                }
                .font(.caption)

                Button("Log Set") { showingLogSet = true }
                    .buttonStyle(.bordered)

                if !workoutManager.loggedSets.isEmpty {
                    Text("\(workoutManager.loggedSets.count) sets logged")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }

                Button("End Workout", role: .destructive) {
                    Task {
                        if let payload = await workoutManager.end() {
                            connectivity.send(payload: payload)
                            summaryPayload = payload
                            showingSummary = true
                        }
                    }
                }
                .buttonStyle(.borderedProminent)
                .tint(.red)
            }
            .padding()
        }
        .navigationBarBackButtonHidden(true)
        .sheet(isPresented: $showingLogSet) {
            LogSetView { exercise, reps, weight in
                workoutManager.logSet(exerciseName: exercise, reps: reps, weightKg: weight)
            }
        }
        .navigationDestination(isPresented: $showingSummary) {
            if let summaryPayload {
                WorkoutSummaryView(payload: summaryPayload)
            }
        }
    }

    private func formattedTime(_ interval: TimeInterval) -> String {
        let minutes = Int(interval) / 60
        let seconds = Int(interval) % 60
        return String(format: "%02d:%02d", minutes, seconds)
    }
}
