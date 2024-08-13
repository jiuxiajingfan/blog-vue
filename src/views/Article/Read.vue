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
            <el-button @click="submit" style="width: 100%">打开</el-button>
            <el-tree-v2
              v-show="show"
              style="max-width: 600px"
              :data="tree"
              :props="props"
              :height="500"
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
const props = {
  value: "tag",
  label: "content",
  children: "children",
};
// 树节点结构定义
function createTreeNode(tagName, content) {
  return {
    tag: tagName,
    content: content,
    children: [],
  };
}
function buildTree(anchors) {
  const root = { children: [] }; // 虚拟根节点
  const stack = [root]; // 栈初始化为根节点

  anchors.forEach((anchor) => {
    const level = parseInt(anchor.tagName[1]); // 获取当前标签的级别 (如 'H2' 的级别是 2)
    const node = createTreeNode(anchor.tagName, anchor.textContent); // 创建当前节点

    // 将当前节点放到正确的父节点的 children 中
    while (stack.length > level) {
      stack.pop(); // 如果当前层次比栈顶元素小或等于，弹出栈顶元素
    }

    stack[stack.length - 1].children.push(node); // 将当前节点作为子节点添加
    stack.push(node); // 当前节点入栈
  });

  return root.children; // 返回根节点的 children 作为最终树结构
}
const show = ref(false);
const submit = () => {
  var elementById = document.getElementById("V1");
  if (elementById) {
    const anchors = elementById.querySelectorAll("h1,h2,h3,h4,h5,h6");
    const titles = Array.from(anchors).filter(
      (title) => !!title.innerText.trim()
    );
    tree.value = buildTree(titles);
    console.log(JSON.stringify(tree, null, 2));
  }
  show.value = true;
};
const junp = (id) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
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
          enable: true,
        },
        anchor: 2,
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
  border-radius: 10px;
  text-align: left;
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
