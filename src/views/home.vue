<template>
  <div>
    <van-nav-bar title="首页" />
    <van-grid>
      <van-grid-item icon="photo-o" text="定期复利计算器" @click="toPage('installment')" />
      <!-- <van-grid-item icon="photo-o" text="文字" />
      <van-grid-item icon="photo-o" text="文字" />
      <van-grid-item icon="photo-o" text="文字" /> -->
    </van-grid>
  </div>
</template>

<script>
export default {
  name: 'Home',
  methods: {
    toPage(name) {
      this.$router.push({
        name: 'installment'
      })
    }
  }
}
</script>

<style></style>
