import SwiftUI

struct ManageTagsView: View {
    @Environment(\.dismiss) private var dismiss
    @ObservedObject private var tagStore = TagStore.shared
    let category: ItemCategory

    @State private var newTagName = ""
    @State private var renamingTag: Tag?
    @State private var renameText = ""

    private var tags: [Tag] {
        tagStore.tags(in: category)
    }

    var body: some View {
        NavigationStack {
            List {
                Section(category == .study ? "Study Tags" : "Task Tags") {
                    ForEach(tags) { tag in
                        Button {
                            renameText = tag.name
                            renamingTag = tag
                        } label: {
                            HStack {
                                Text(tag.name)
                                    .foregroundStyle(.primary)
                                Spacer()
                                Image(systemName: "pencil")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                        }
                    }
                    .onDelete { offsets in
                        for index in offsets {
                            tagStore.delete(id: tags[index].id)
                        }
                    }
                }

                Section("Add Tag") {
                    HStack {
                        TextField("New tag name", text: $newTagName)
                            .submitLabel(.done)
                            .onSubmit(addTag)
                        Button("Add", action: addTag)
                            .disabled(newTagName.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                    }
                }
            }
            .navigationTitle("Manage Tags")
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") { dismiss() }
                }
            }
            .alert(
                "Rename Tag",
                isPresented: Binding(
                    get: { renamingTag != nil },
                    set: { isPresented in if !isPresented { renamingTag = nil } }
                ),
                presenting: renamingTag
            ) { tag in
                TextField("Name", text: $renameText)
                Button("Save") {
                    tagStore.rename(id: tag.id, name: renameText)
                    renamingTag = nil
                }
                Button("Cancel", role: .cancel) {
                    renamingTag = nil
                }
            }
        }
    }

    private func addTag() {
        tagStore.add(name: newTagName, category: category)
        newTagName = ""
    }
}
