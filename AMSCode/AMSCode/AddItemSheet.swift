import SwiftUI

struct AddItemSheet: View {
    @Environment(\.dismiss) private var dismiss
    let category: ItemCategory
    let onAdd: (String) -> Void

    @State private var title = ""
    @FocusState private var isFocused: Bool

    var body: some View {
        NavigationStack {
            Form {
                TextField(
                    category == .study ? "e.g. Review chapter 5" : "e.g. Reply to emails",
                    text: $title
                )
                .focused($isFocused)
                .submitLabel(.done)
                .onSubmit(add)
            }
            .navigationTitle(category == .study ? "New Study Item" : "New Task")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Add", action: add)
                        .disabled(title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                }
            }
            .onAppear { isFocused = true }
        }
    }

    private func add() {
        onAdd(title)
        dismiss()
    }
}
