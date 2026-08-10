import WidgetKit
import SwiftUI

struct TasksProvider: TimelineProvider {
    func placeholder(in context: Context) -> ItemsEntry {
        ItemsEntry(date: Date(), items: [
            Item(title: "Reply to emails", category: .task),
            Item(title: "Pack gym bag", isDone: true, category: .task)
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
        return ItemStore.shared.items(in: .task)
    }
}

struct TasksWidgetEntryView: View {
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
            Label("Tasks", systemImage: "checklist")
                .font(.caption)
                .foregroundStyle(.secondary)

            if entry.items.isEmpty {
                Text("No tasks. Add some in the app.")
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

struct TasksWidget: Widget {
    let kind: String = "TasksWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: TasksProvider()) { entry in
            TasksWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Tasks Checklist")
        .description("Track your to-dos and check them off.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}
