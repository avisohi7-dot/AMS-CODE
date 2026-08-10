import WidgetKit
import SwiftUI

struct StudyProvider: TimelineProvider {
    func placeholder(in context: Context) -> ItemsEntry {
        ItemsEntry(
            date: Date(),
            items: [
                Item(title: "Review chapter 4", category: .study),
                Item(title: "Flashcards: vocab", isDone: true, category: .study)
            ],
            tags: TagStore.defaultTagsForPreview(in: .study)
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (ItemsEntry) -> Void) {
        completion(currentEntry())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<ItemsEntry>) -> Void) {
        completion(Timeline(entries: [currentEntry()], policy: .never))
    }

    private func currentEntry() -> ItemsEntry {
        ItemStore.shared.refresh()
        TagStore.shared.refresh()
        return ItemsEntry(
            date: Date(),
            items: ItemStore.shared.items(in: .study),
            tags: TagStore.shared.tags(in: .study)
        )
    }
}

struct StudyWidgetEntryView: View {
    @Environment(\.widgetFamily) private var family
    let entry: ItemsEntry

    private var maxCount: Int {
        switch family {
        case .systemSmall: return 3
        case .systemMedium: return 3
        default: return 6
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Label("Study", systemImage: "book.fill")
                .font(.caption)
                .foregroundStyle(.secondary)

            if entry.items.isEmpty {
                Text("No study items. Add some in the app.")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            } else {
                ForEach(entry.items.prefix(maxCount)) { item in
                    ChecklistRow(item: item, availableTags: entry.tags)
                }
            }
            Spacer(minLength: 0)
        }
        .padding(.vertical, 2)
        .containerBackground(.fill.tertiary, for: .widget)
    }
}

struct StudyWidget: Widget {
    let kind: String = "StudyWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: StudyProvider()) { entry in
            StudyWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Study Checklist")
        .description("Track your study items, tag them, and check them off.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}
