<template>
  <BackGround></BackGround>
  <div class="goto">
    <el-scrollbar height="100vh">
      <Header></Header>
      <el-row style="margin-top: 2%">
        <el-col :span="16" :offset="4">
          <div class="article" id="article">
            <el-card shadow="none" class="cardCss2">
              <template #header>
                <div style="text-align: center">
                  <h2>{{ title }}</h2>
                  <el-icon style="margin-top: 5px">
                    <Clock />
                  </el-icon>
                  <span> 发布时间： {{ date }}</span>
                </div>
              </template>
              <div id="V1" ref="vv"></div>
            </el-card>
          </div>
        </el-col>
        <el-col :span="4">
          <el-affix :offset="0">
            <el-button
              @click="submit"
              plain
              style="width: 100%; height: 40px"
              class="c1"
              >{{ tip }}</el-button
            >
            <el-tree
              v-if="show"
              style="max-width: 600px"
              :data="tree"
              :props="props"
              :height="500"
              node-key="id"
              @node-click="junp"
              :default-expanded-keys="defaultExpandedKeys"
              class="c1"
            />
          </el-affix>
        </el-col>
      </el-row>
      <Footer></Footer>
    </el-scrollbar>
  </div>
</template>

<script setup>
import BackGround from "@/components/BackGround";
import Header from "@/components/Header";
import { onBeforeMount, ref } from "vue";
import api from "@/api/api";
import router from "@/router";
import VditorPreview from "vditor/dist/method.min";
import "vditor/dist/index.css";
import Footer from "@/components/Footer";

const body = ref("");
const title = ref("");
const desc = ref("");
const date = ref("");
const date2 = ref("");
const vv = ref();
const tree = ref();
const Id = ref(0);
const props = {
  value: "id",
  label: "content",
  children: "children",
};
const tip = ref("打开大纲");
const defaultExpandedKeys = ref([]);
function buildTree(anchors) {
  const tree = [];
  const stack = [];

  anchors.forEach((anchor) => {
    const level = parseInt(anchor.tagName.substring(1)); // Get the level from 'h1', 'h2', etc.
    const node = {
      level,
      content: anchor.textContent,
      children: [],
      tag: anchor,
      id: Id.value++,
    };
    defaultExpandedKeys.value.push(node.id);
    // Find the correct parent for the current node
    while (stack.length > 0 && stack[stack.length - 1].level >= level) {
      stack.pop();
    }

    if (stack.length === 0) {
      // No parent, this is a root node
      tree.push(node);
    } else {
      // Attach this node to the last node in the stack
      stack[stack.length - 1].children.push(node);
    }

    // Add the current node to the stack
    stack.push(node);
  });

  return tree;
}

const flag = ref(true);
const show = ref(false);
const submit = () => {
  if (!show.value) {
    tip.value = "收起大纲";
  } else {
    tip.value = "打开大纲";
  }
  if (flag.value && !show.value) {
    var elementById = document.getElementById("V1");
    if (elementById) {
      const anchors = elementById.querySelectorAll("h1,h2,h3,h4,h5,h6");
      const titles = Array.from(anchors).filter(
        (title) => !!title.innerText.trim()
      );
      tree.value = buildTree(titles);
    }
  }
  show.value = !show.value;
  flag.value = false;
  console.log(tree.value);
};
const junp = (p1, p2, p3, p4) => {
  console.log(p1.tag);
  if (p1.tag) {
    p1.tag.scrollIntoView({ behavior: "smooth" });
  }
};
onBeforeMount(() => {
  api
    .get("article/getArticle", {
      params: {
        id: router.currentRoute.value.query.id,
      },
    })
    .then((res) => {
      body.value = res.data.data.body;
      title.value = res.data.data.title;
      desc.value = res.data.data.descript;
      date.value = res.data.data.gmtCreate;
      date2.value = res.data.data.gmtUpdate;
      VditorPreview.preview(document.getElementById("V1"), body.value, {
        mode: "dark",
        speech: {
          enable: false,
        },
        anchor: 0,
        hljs: {
          lineNumber: true,
          style: "dracula",
        },
      });
    });
});
</script>

<style lang="scss" scoped>
.cardCss2 {
  text-align: left;
  background-color: rgba(255, 255, 255, 0.7);
}
.c1 {
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0.7);
}
.html_output {
  text-align: left;
}

.leftbutton {
  border-radius: 8px;
  text-align: left;
  border-top-left-radius: 32px;
  border-bottom-left-radius: 32px;
  padding: 30px;
  font-family: UbuntuMono, "PingFang SC", "Microsoft YaHei", Helvetica, Arial,
    Menlo, Monaco, monospace, sans-serif;
}

.rightbutton {
  border-radius: 8px;
  text-align: left;
  border-top-right-radius: 32px;
  border-bottom-right-radius: 32px;
  padding: 30px;
  font-family: UbuntuMono, "PingFang SC", "Microsoft YaHei", Helvetica, Arial,
    Menlo, Monaco, monospace, sans-serif;
}
</style>
