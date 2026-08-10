import Foundation
import WidgetKit

/// Shared between the app and the widget extension via an App Group.
/// Each process (app / widget extension) has its own instance, so
/// `refresh()` re-reads from disk before anything that needs fresh data.
final class ItemStore: ObservableObject {
    static let shared = ItemStore()

    @Published private(set) var items: [Item]

    private let defaults: UserDefaults?
    private let storageKey = "com.example.amscode.items"

    private init() {
        let defaults = UserDefaults(suiteName: AppGroup.identifier)
        self.defaults = defaults
        self.items = Self.load(from: defaults, key: storageKey)
    }

    /// Re-reads from the shared App Group store. Call before reading
    /// `items`/`items(in:)` from a process that didn't just write the data.
    func refresh() {
        items = Self.load(from: defaults, key: storageKey)
    }

    func items(in category: ItemCategory) -> [Item] {
        items
            .filter { $0.category == category }
            .sorted { lhs, rhs in
                if lhs.isDone != rhs.isDone { return !lhs.isDone && rhs.isDone }
                return lhs.createdAt < rhs.createdAt
            }
    }

    func add(title: String, category: ItemCategory) {
        let trimmed = title.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }
        items.append(Item(title: trimmed, category: category))
        persist()
    }

    func toggle(id: UUID) {
        guard let index = items.firstIndex(where: { $0.id == id }) else { return }
        items[index].isDone.toggle()
        persist()
    }

    func delete(id: UUID) {
        items.removeAll { $0.id == id }
        persist()
    }

    func delete(at offsets: IndexSet, in category: ItemCategory) {
        let filtered = items(in: category)
        let idsToDelete = offsets.map { filtered[$0].id }
        items.removeAll { idsToDelete.contains($0.id) }
        persist()
    }

    private func persist() {
        guard let defaults, let data = try? JSONEncoder().encode(items) else { return }
        defaults.set(data, forKey: storageKey)
        WidgetCenter.shared.reloadAllTimelines()
    }

    private static func load(from defaults: UserDefaults?, key: String) -> [Item] {
        guard let defaults,
              let data = defaults.data(forKey: key),
              let decoded = try? JSONDecoder().decode([Item].self, from: data)
        else {
            return []
        }
        return decoded
    }
}
