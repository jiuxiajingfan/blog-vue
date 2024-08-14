<template>
  <el-card class="main-card">
    <template #header><h3>账号设置</h3></template>
    <el-collapse v-model="activeNames" accordion>
      <el-collapse-item
        v-for="section in sections"
        :name="section.name"
        :key="section.name"
        :icon="section.icon"
      >
        <template #title>
          <el-icon size="20px" class="icon">
            <component :is="section.icon" />
          </el-icon>
          <span class="section-title">{{ section.title }}</span></template
        >
        <el-card class="inner-card" shadow="hover">
          <div v-if="section.name === '1'">
            <h4>账号信息</h4>
            <!-- 账号信息的内容 -->
            <el-form :model="userModel">
              <el-form-item label="邮箱">
                <el-input v-model="userModel.email" />
              </el-form-item>
              <el-form-item label="GitHub">
                <el-input v-model="userModel.github" />
              </el-form-item>
              <el-form-item label="网站备案号 :">
                <el-input v-model="userModel.record"></el-input>
              </el-form-item>
              <el-form-item label="网站主标题 :">
                <el-input v-model="userModel.zhu"></el-input>
              </el-form-item>
              <el-form-item label="网站副标题 :">
                <el-input v-model="userModel.fu"></el-input>
              </el-form-item>
              <el-button type="primary" @click="changeMessage"
                >保存更改</el-button
              >
            </el-form>
          </div>
          <div v-if="section.name === '2'">
            <h4>密码修改</h4>
            <!-- 密码修改的内容 -->
            <el-form
              :model="userModel"
              ref="changePasswordModel"
              :rules="rules"
            >
              <el-form-item label="原密码" prop="pwdOriginal">
                <el-input
                  type="password"
                  v-model="userModel.pwdOriginal"
                  show-password
                />
              </el-form-item>
              <el-form-item label="新密码" prop="pwdNew">
                <el-input
                  type="password"
                  v-model="userModel.pwdNew"
                  show-password
                />
              </el-form-item>
              <el-form-item label="确认新密码" prop="pwdNew2">
                <el-input
                  type="password"
                  v-model="userModel.pwdNew2"
                  show-password
                />
              </el-form-item>
              <el-button type="primary" @click="changePassword"
                >修改密码</el-button
              >
            </el-form>
          </div>
          <div v-if="section.name === '3'">
            <h4>图片设置</h4>
            <el-card shadow="none">
              <template #header>
                <el-form :model="userModel" label-width="120px">
                  <el-form-item label="头像地址 :">
                    <el-input v-model="userModel.pic"></el-input>
                  </el-form-item>
                  <h4>空值保存刷新页面后自动清除</h4>
                  <el-scrollbar height="500px">
                    <el-form-item label="背景图片 :" prop="pwdNew">
                      <el-input
                        v-for="(item, index) in count"
                        :key="item"
                        v-model="userModel.backImg[index]"
                      ></el-input>
                      <el-icon @click="count++" size="40px">
                        <CirclePlus />
                      </el-icon>
                    </el-form-item>
                    <el-button @click="changePic" type="primary"
                      >确定</el-button
                    >
                  </el-scrollbar>
                </el-form>
              </template>
            </el-card>
          </div>
        </el-card>
      </el-collapse-item>
    </el-collapse>
  </el-card>
</template>
<script setup>
import { reactive, ref, computed } from "vue";
import { ElNotification } from "element-plus";
import api from "@/api/api";
import utils from "@/utils/utils";
import router from "@/router";
import { useConfigStore } from "@/store/config";
import { useAuthStore } from "@/store/auth";
import md5 from "js-md5";
import pinia from "@/store/store";

const Auth = useAuthStore(pinia);
const config = useConfigStore(pinia);
const userModel = reactive({
  github: config.getGithub,
  email: config.getEmail,
  pwdOriginal: "",
  pwdNew: "",
  pwdNew2: "",
  nickname: config.getNickname,
  record: config.getRecord,
  backImg: config.getBackImg,
  pic: config.getPic,
  zhu: config.getTitle,
  fu: config.getTitle2,
  userName: config.getUserName,
});
const activeNames = ref(["1"]);
const changePasswordModel = ref();
const count = ref(config.getBackImg.length);
const sections = computed(() => [
  { name: "1", icon: "Tickets", title: "账号信息" },
  {
    name: "2",
    icon: "Setting",
    title: "密码修改",
  },
  { name: "3", icon: "PictureFilled", title: "图片设置" },
]);
const checkPassword = (rule, value, callback) => {
  const regEmail = /^(?![a-zA-Z]+$)(?!\d+$)(?![^\da-zA-Z\s]+$).{8,30}$/;
  regEmail.test(value) ? callback() : callback(new Error("密码格式不正确"));
};
const rules = reactive({
  pwdOriginal: [{ required: true, validator: checkPassword, trigger: "blur" }],
  pwdNew: [{ required: true, validator: checkPassword, trigger: "blur" }],
  pwdNew2: [{ required: true, validator: checkPassword, trigger: "blur" }],
  name: [
    {
      required: true,
      min: 1,
      max: 20,
      message: "用户名长度为1-20位",
      trigger: "blur",
    },
  ],
});
const changePic = () => {
  userModel.backImg = userModel.backImg.filter((item) => item !== "");
  count.value = userModel.backImg.length;
  api
    .post("/user/changePic", { back: userModel.backImg, pic: userModel.pic })
    .then((res) => {
      utils.showMessage(res.data.code, res.data.msg);
      if (res.data.code === 200) {
        config.setBackPic(userModel.backImg);
        config.setPic(userModel.pic);
      }
    });
};
const changePassword = () => {
  changePasswordModel.value.validate((valid) => {
    if (valid) {
      api
        .post("/user/changePwd", {
          pwdOriginal: md5(userModel.pwdOriginal + config.getUserName),
          pwdNew: md5(userModel.pwdNew + config.getUserName),
          pwdConfirm: md5(userModel.pwdNew2 + config.getUserName),
        })
        .then((res) => {
          if (res.data.code === 200) {
            localStorage.removeItem("token");
            Auth.setToken(null);
            router.push("/");
            ElNotification({
              title: "Success",
              message: "请重新登录",
              type: "success",
            });
          } else {
            utils.showMessage(res.data.code, res.data.msg);
          }
        });
    }
  });
};
const changeMessage = () => {
  api
    .post("/user/changeMessage", {
      email: userModel.email,
      github: userModel.github,
      record: userModel.record,
      title: userModel.zhu,
      title2: userModel.fu,
    })
    .then((res) => {
      utils.showMessage(res.data.code, res.data.msg);
      if (res.data.code === 200) {
        config.setEmail(userModel.email);
        config.setTitle(userModel.zhu);
        config.setTitle2(userModel.fu);
        config.setRecord(userModel.record);
        config.setGithub(userModel.github);
      }
    });
};
</script>
<style scoped>
.main-card {
  height: 90vh;
  max-width: 800px;
  margin: 2% auto;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background-color: #ffffff;
}

.inner-card {
  padding: 20px;
  background-color: #f7f9fc;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.icon {
  color: #409eff;
}

.section-title {
  margin-left: 10px;
  font-size: 18px;
  color: #333;
}

.el-collapse-item__header {
  padding: 16px;
  font-size: 16px;
  font-weight: 500;
}

.el-collapse-item__header:hover {
  background-color: #f2f6fc;
}

h3 {
  font-size: 24px;
  font-weight: bold;
  color: #1f2d3d;
}

h4 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.el-form-item {
  margin-bottom: 16px;
}
</style>
