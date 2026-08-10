import Foundation
import WidgetKit

/// User-editable tags per category (e.g. Study: Math/Science..., Task:
/// Work/Personal...), shared with the widgets the same way `ItemStore` is.
final class TagStore: ObservableObject {
    static let shared = TagStore()

    @Published private(set) var tags: [Tag]

    private let defaults: UserDefaults?
    private let storageKey = "com.example.amscode.tags"

    private static let defaultTags: [Tag] = [
        Tag(name: "Math", category: .study),
        Tag(name: "Science", category: .study),
        Tag(name: "History", category: .study),
        Tag(name: "Language", category: .study),
        Tag(name: "Reading", category: .study),
        Tag(name: "Work", category: .task),
        Tag(name: "Personal", category: .task),
        Tag(name: "Errands", category: .task),
        Tag(name: "Home", category: .task)
    ]

    private init() {
        let defaults = UserDefaults(suiteName: AppGroup.identifier)
        self.defaults = defaults
        if let loaded = Self.load(from: defaults, key: storageKey) {
            tags = loaded
        } else {
            tags = Self.defaultTags
            Self.save(tags, to: defaults, key: storageKey)
        }
    }

    /// Re-reads from the shared App Group store. Call before reading
    /// `tags`/`tags(in:)` from a process that didn't just write the data.
    func refresh() {
        if let loaded = Self.load(from: defaults, key: storageKey) {
            tags = loaded
        }
    }

    /// Sample tags for widget placeholder/preview rendering only.
    static func defaultTagsForPreview(in category: ItemCategory) -> [Tag] {
        defaultTags.filter { $0.category == category }
    }

    func tags(in category: ItemCategory) -> [Tag] {
        tags
            .filter { $0.category == category }
            .sorted { $0.name.localizedCaseInsensitiveCompare($1.name) == .orderedAscending }
    }

    func add(name: String, category: ItemCategory) {
        let trimmed = name.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }
        tags.append(Tag(name: trimmed, category: category))
        persist()
    }

    func rename(id: UUID, name: String) {
        let trimmed = name.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty, let index = tags.firstIndex(where: { $0.id == id }) else { return }
        tags[index].name = trimmed
        persist()
    }

    func delete(id: UUID) {
        tags.removeAll { $0.id == id }
        ItemStore.shared.clearTag(id)
        persist()
    }

    private func persist() {
        Self.save(tags, to: defaults, key: storageKey)
        WidgetCenter.shared.reloadAllTimelines()
    }

    private static func load(from defaults: UserDefaults?, key: String) -> [Tag]? {
        guard let defaults,
              let data = defaults.data(forKey: key),
              let decoded = try? JSONDecoder().decode([Tag].self, from: data)
        else {
            return nil
        }
        return decoded
    }

    private static func save(_ tags: [Tag], to defaults: UserDefaults?, key: String) {
        guard let defaults, let data = try? JSONEncoder().encode(tags) else { return }
        defaults.set(data, forKey: key)
    }
}
