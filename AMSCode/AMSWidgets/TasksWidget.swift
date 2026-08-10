import WidgetKit
import SwiftUI

struct TasksProvider: TimelineProvider {
    func placeholder(in context: Context) -> ItemsEntry {
        ItemsEntry(
            date: Date(),
            items: [
                Item(title: "Reply to emails", category: .task),
                Item(title: "Pack gym bag", isDone: true, category: .task)
            ],
            tags: TagStore.defaultTagsForPreview(in: .task)
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
            items: ItemStore.shared.items(in: .task),
            tags: TagStore.shared.tags(in: .task)
        )
    }
}

struct TasksWidgetEntryView: View {
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
            Label("Tasks", systemImage: "checklist")
                .font(.caption)
                .foregroundStyle(.secondary)

            if entry.items.isEmpty {
                Text("No tasks. Add some in the app.")
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

struct TasksWidget: Widget {
    let kind: String = "TasksWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: TasksProvider()) { entry in
            TasksWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Tasks Checklist")
        .description("Track your to-dos, tag them, and check them off.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}
