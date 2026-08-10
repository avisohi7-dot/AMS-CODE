import SwiftUI

struct ItemListView: View {
    @ObservedObject private var store = ItemStore.shared
    @ObservedObject private var tagStore = TagStore.shared
    let category: ItemCategory
    let title: String
    let systemImage: String

    @State private var isAddingItem = false
    @State private var isManagingTags = false
    @State private var editingItem: Item?

    private var items: [Item] {
        store.items(in: category)
    }

    var body: some View {
        NavigationStack {
            List {
                if items.isEmpty {
                    ContentUnavailableView(
                        "Nothing here yet",
                        systemImage: systemImage,
                        description: Text("Tap + to add your first item.")
                    )
                } else {
                    ForEach(items) { item in
                        ItemRow(item: item, tagName: tagName(for: item)) {
                            store.toggle(id: item.id)
                        }
                        .swipeActions(edge: .leading) {
                            Button {
                                editingItem = item
                            } label: {
                                Label("Edit", systemImage: "pencil")
                            }
                            .tint(.blue)
                        }
                    }
                    .onDelete { offsets in
                        store.delete(at: offsets, in: category)
                    }
                }
            }
            .navigationTitle(title)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button {
                        isManagingTags = true
                    } label: {
                        Image(systemName: "tag")
                    }
                }
                ToolbarItem(placement: .primaryAction) {
                    Button {
                        isAddingItem = true
                    } label: {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $isAddingItem) {
                ItemEditorSheet(category: category)
            }
            .sheet(item: $editingItem) { item in
                ItemEditorSheet(category: category, existingItem: item)
            }
            .sheet(isPresented: $isManagingTags) {
                ManageTagsView(category: category)
            }
        }
    }

    private func tagName(for item: Item) -> String? {
        guard let tagID = item.tagID else { return nil }
        return tagStore.tags(in: category).first(where: { $0.id == tagID })?.name
    }
}

private struct ItemRow: View {
    let item: Item
    let tagName: String?
    let onToggle: () -> Void

    private static let dateFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        return formatter
    }()

    private var isOverdue: Bool {
        guard let dueDate = item.dueDate, !item.isDone else { return false }
        return dueDate < Calendar.current.startOfDay(for: Date())
    }

    var body: some View {
        Button(action: onToggle) {
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Image(systemName: item.isDone ? "checkmark.circle.fill" : "circle")
                        .foregroundStyle(item.isDone ? .green : .secondary)
                    Text(item.title)
                        .strikethrough(item.isDone)
                        .foregroundStyle(item.isDone ? .secondary : .primary)
                }

                if tagName != nil || item.dueDate != nil {
                    HStack(spacing: 10) {
                        if let tagName {
                            Label(tagName, systemImage: "tag")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                        if let dueDate = item.dueDate {
                            Label(Self.dateFormatter.string(from: dueDate), systemImage: "calendar")
                                .font(.caption)
                                .foregroundStyle(isOverdue ? .red : .secondary)
                        }
                    }
                    .padding(.leading, 28)
                }
            }
        }
        .buttonStyle(.plain)
    }
}
