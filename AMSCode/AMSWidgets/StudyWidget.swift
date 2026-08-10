import WidgetKit
import SwiftUI

struct StudyProvider: TimelineProvider {
    func placeholder(in context: Context) -> ItemsEntry {
        ItemsEntry(date: Date(), items: [
            Item(title: "Review chapter 4", category: .study),
            Item(title: "Flashcards: vocab", isDone: true, category: .study)
        ])
    }

    func getSnapshot(in context: Context, completion: @escaping (ItemsEntry) -> Void) {
        completion(ItemsEntry(date: Date(), items: currentItems()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<ItemsEntry>) -> Void) {
        let entry = ItemsEntry(date: Date(), items: currentItems())
        completion(Timeline(entries: [entry], policy: .never))
    }

    private func currentItems() -> [Item] {
        ItemStore.shared.refresh()
        return ItemStore.shared.items(in: .study)
    }
}

struct StudyWidgetEntryView: View {
    @Environment(\.widgetFamily) private var family
    let entry: ItemsEntry

    private var maxCount: Int {
        switch family {
        case .systemSmall: return 3
        case .systemMedium: return 5
        default: return 8
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
                    ChecklistRow(item: item)
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
        .description("Track your study items and check them off.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}
