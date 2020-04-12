<template>
  <div class="editor">
    <editor-menu-bar :editor="editor" v-slot="{ commands, isActive }">
      <div class="menubar">
        <div class="toolbar">
          <button class="menubar__button" @click="commands.undo">
            Undo
            <!-- <icon name="undo" />Undo -->
          </button>

          <button class="menubar__button" @click="commands.redo">
            <!-- <icon name="redo" /> -->
            Redo
          </button>

          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.bold() }"
            @click="commands.bold"
          >
            Bold
            <!-- <icon name="bold" /> -->
          </button>

          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.italic() }"
            @click="commands.italic"
          >
            Italic
            <!-- <icon name="italic" /> -->
          </button>

          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.strike() }"
            @click="commands.strike"
          >
            Strikethrough
            <!-- <icon name="strike" /> -->
          </button>

          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.underline() }"
            @click="commands.underline"
          >
            Underline
            <!-- <icon name="underline" /> -->
          </button>

          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.code() }"
            @click="commands.code"
          >
            Code
            <!-- <icon name="code" /> -->
          </button>

          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.paragraph() }"
            @click="commands.paragraph"
          >
            Paragraph
            <!-- <icon name="paragraph" /> -->
          </button>

          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.heading({ level: 1 }) }"
            @click="commands.heading({ level: 1 })"
          >H1</button>

          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.heading({ level: 2 }) }"
            @click="commands.heading({ level: 2 })"
          >H2</button>

          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.heading({ level: 3 }) }"
            @click="commands.heading({ level: 3 })"
          >H3</button>

          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.bullet_list() }"
            @click="commands.bullet_list"
          >
            Bullet list
            <!-- <icon name="ul" /> -->
          </button>

          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.ordered_list() }"
            @click="commands.ordered_list"
          >
            Ordered List
            <!-- <icon name="ol" /> -->
          </button>

          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.blockquote() }"
            @click="commands.blockquote"
          >
            Quote
            <!-- <icon name="quote" /> -->
          </button>

          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.code_block() }"
            @click="commands.code_block"
          >
            Code Block
            <!-- <icon name="code" /> -->
          </button>

          <button
            class="menubar__button"
            @click="commands.createTable({rowsCount: 3, colsCount: 3, withHeaderRow: false })"
          >
            Table
            <!-- <icon name="table" /> -->
          </button>

          <span v-if="isActive.table()">
            <button class="menubar__button" @click="commands.deleteTable">
              <!-- <icon name="delete_table" /> -->
              Delete Table
            </button>
            <button class="menubar__button" @click="commands.addColumnBefore">
              <!-- <icon name="add_col_before" /> -->
              Add column before
            </button>
            <button class="menubar__button" @click="commands.addColumnAfter">
              <!-- <icon name="add_col_after" /> -->
              Add column after
            </button>
            <button class="menubar__button" @click="commands.deleteColumn">
              Delete Column
              <!-- <icon name="delete_col" /> -->
            </button>
            <button class="menubar__button" @click="commands.addRowBefore">
              Add row before
              <!-- <icon name="add_row_before" /> -->
            </button>
            <button class="menubar__button" @click="commands.addRowAfter">
              Add row after
              <!-- <icon name="add_row_after" /> -->
            </button>
            <button class="menubar__button" @click="commands.deleteRow">
              Delete row
              <!-- <icon name="delete_row" /> -->
            </button>
            <button class="menubar__button" @click="commands.toggleCellMerge">
              Combine row
              <!-- <icon name="combine_cells" /> -->
            </button>
          </span>
        </div>
      </div>
    </editor-menu-bar>

    <editor-content class="editor__content" :editor="editor" />
  </div>
</template>

<style lang="scss">
@import "../assets/sass/main.scss";
</style>

<script>
import { Editor, EditorContent, EditorMenuBar } from "tiptap";
import {
  Blockquote,
  CodeBlock,
  HardBreak,
  Heading,
  OrderedList,
  BulletList,
  ListItem,
  TodoItem,
  TodoList,
  Bold,
  Code,
  Italic,
  Link,
  Table,
  TableHeader,
  TableCell,
  TableRow,
  Strike,
  Underline,
  History
} from "tiptap-extensions";

export default {
  components: {
    EditorContent,
    EditorMenuBar
  },
  props: {
    enablePaste: Boolean
  },
  data() {
    let pasteProp = {};
    if (!this.enablePaste) {
      pasteProp = {
        handlePaste: () => {
          return true;
        }
      };
    }
    return {
      editor: new Editor({
        editorProps: pasteProp,
        extensions: [
          new Blockquote(),
          new BulletList(),
          new CodeBlock(),
          new HardBreak(),
          new Heading({ levels: [1, 2, 3] }),
          new ListItem(),
          new OrderedList(),
          new TodoItem(),
          new TodoList(),
          new Link(),
          new Bold(),
          new Code(),
          new Italic(),
          new Strike(),
          new Underline(),
          new History(),
          new Table({
            resizable: true
          }),
          new TableHeader(),
          new TableCell(),
          new TableRow()
        ],
        content: `
            <h2>
              Tables
            </h2>
            <p>
              Tables come with some useful commands like adding, removing or merging rows and columns. Navigate with <code>tab</code> or arrow keys. Resizing is also supported.
            </p>
            <table>
              <tr>
                <th colspan="3" data-colwidth="100,0,0">Wide header</th>
              </tr>
              <tr>
                <td>One</td>
                <td>Two</td>
                <td>Three</td>
              </tr>
              <tr>
                <td>Four</td>
                <td>Five</td>
                <td>Six</td>
              </tr>
            </table>
          `
      })
    };
  },
  methods: {
    getContent() {
      return this.editor.getJSON();
    }
  },
  beforeDestroy() {
    this.editor.destroy();
  }
};
</script>