import SwiftUI
import SwiftData

struct NewGoalView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss

    @State private var title = ""
    @State private var type: GoalType = .weeklyWorkouts
    @State private var targetValue: Double = 3
    @State private var deadline: Date?
    @State private var hasDeadline = false

    var body: some View {
        NavigationStack {
            Form {
                TextField("Title", text: $title)
                Picker("Type", selection: $type) {
                    ForEach(GoalType.allCases) { type in
                        Text(type.displayName).tag(type)
                    }
                }
                HStack {
                    Text("Target")
                    Spacer()
                    TextField("Target", value: $targetValue, format: .number)
                        .keyboardType(.decimalPad)
                        .multilineTextAlignment(.trailing)
                    Text(type.defaultUnit).foregroundStyle(.secondary)
                }
                Toggle("Set a deadline", isOn: $hasDeadline)
                if hasDeadline {
                    DatePicker(
                        "Deadline",
                        selection: Binding(get: { deadline ?? .now }, set: { deadline = $0 }),
                        displayedComponents: .date
                    )
                }
            }
            .navigationTitle("New Goal")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") { save() }.disabled(title.isEmpty)
                }
            }
        }
    }

    private func save() {
        let goal = Goal(title: title, type: type, targetValue: targetValue, deadline: hasDeadline ? deadline : nil)
        modelContext.insert(goal)
        dismiss()
    }
}
