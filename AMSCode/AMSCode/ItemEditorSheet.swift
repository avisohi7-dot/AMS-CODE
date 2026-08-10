import SwiftUI

struct ItemEditorSheet: View {
    @Environment(\.dismiss) private var dismiss
    @ObservedObject private var store = ItemStore.shared
    @ObservedObject private var tagStore = TagStore.shared
    let category: ItemCategory
    let existingItem: Item?

    @State private var title: String
    @State private var tagID: UUID?
    @State private var hasDueDate: Bool
    @State private var dueDate: Date
    @FocusState private var isFocused: Bool

    init(category: ItemCategory, existingItem: Item? = nil) {
        self.category = category
        self.existingItem = existingItem
        _title = State(initialValue: existingItem?.title ?? "")
        _tagID = State(initialValue: existingItem?.tagID)
        _hasDueDate = State(initialValue: existingItem?.dueDate != nil)
        _dueDate = State(initialValue: existingItem?.dueDate ?? Calendar.current.date(byAdding: .day, value: 1, to: Date()) ?? Date())
    }

    private var tags: [Tag] {
        tagStore.tags(in: category)
    }

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    TextField(
                        category == .study ? "e.g. Review chapter 5" : "e.g. Reply to emails",
                        text: $title
                    )
                    .focused($isFocused)
                }

                Section("Tag") {
                    Picker("Tag", selection: $tagID) {
                        Text("No tag").tag(UUID?.none)
                        ForEach(tags) { tag in
                            Text(tag.name).tag(Optional(tag.id))
                        }
                    }
                    .pickerStyle(.menu)
                }

                Section("Due Date") {
                    Toggle("Has due date", isOn: $hasDueDate.animation())
                    if hasDueDate {
                        DatePicker("Due", selection: $dueDate, displayedComponents: .date)
                    }
                }
            }
            .navigationTitle(existingItem == nil ? (category == .study ? "New Study Item" : "New Task") : "Edit Item")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save", action: save)
                        .disabled(title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                }
            }
            .onAppear { isFocused = existingItem == nil }
        }
    }

    private func save() {
        let finalDueDate = hasDueDate ? dueDate : nil
        if let existingItem {
            store.update(id: existingItem.id, title: title, tagID: tagID, dueDate: finalDueDate)
        } else {
            store.add(title: title, category: category, tagID: tagID, dueDate: finalDueDate)
        }
        dismiss()
    }
}
