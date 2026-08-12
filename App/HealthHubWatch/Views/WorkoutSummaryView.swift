import SwiftUI

struct WorkoutSummaryView: View {
    var payload: WorkoutSyncPayload

    var body: some View {
        ScrollView {
            VStack(spacing: 8) {
                Image(systemName: "checkmark.circle.fill")
                    .font(.largeTitle)
                    .foregroundStyle(.green)
                Text("Workout Saved").font(.headline)
                Text(payload.activityName).font(.subheadline).foregroundStyle(.secondary)
                Text("\(Int(payload.endDate.timeIntervalSince(payload.startDate) / 60)) min · \(payload.sets.count) sets")
                    .font(.caption)
            }
            .padding()
        }
        .navigationBarBackButtonHidden(true)
    }
}
