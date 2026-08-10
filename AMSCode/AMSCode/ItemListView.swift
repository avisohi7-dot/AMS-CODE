import SwiftUI

struct ItemListView: View {
    @ObservedObject private var store = ItemStore.shared
    let category: ItemCategory
    let title: String
    let systemImage: String

    @State private var isAddingItem = false

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
                        Button {
                            store.toggle(id: item.id)
                        } label: {
                            HStack {
                                Image(systemName: item.isDone ? "checkmark.circle.fill" : "circle")
                                    .foregroundStyle(item.isDone ? .green : .secondary)
                                Text(item.title)
                                    .strikethrough(item.isDone)
                                    .foregroundStyle(item.isDone ? .secondary : .primary)
                            }
                        }
                        .buttonStyle(.plain)
                    }
                    .onDelete { offsets in
                        store.delete(at: offsets, in: category)
                    }
                }
            }
            .navigationTitle(title)
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button {
                        isAddingItem = true
                    } label: {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $isAddingItem) {
                AddItemSheet(category: category) { title in
                    store.add(title: title, category: category)
                }
            }
        }
    }
}
