<template>
  <div>
    <van-nav-bar title="首页" />
    <van-grid>
      <van-grid-item icon="photo-o" text="定期复利" @click="toPage('installment')" />
      <van-grid-item icon="like-o" text="教育金年复利" @click="toPage('education')" />
      <!-- <van-grid-item icon="photo-o" text="文字" />
      <van-grid-item icon="photo-o" text="文字" />
      <van-grid-item icon="photo-o" text="文字" /> -->
    </van-grid>
    <div class="info">
      <h3>一些说明：</h3>
      <p>新生儿年龄是0岁开始；</p>
      <p>每一期展示的都是这一期结束产生的费用，例如第一期（年）缴费1000，产生的利息就是1000一年的利息，总花费就是1000+利息</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  methods: {
    toPage(name) {
      this.$router.push({
        name: name
      })
    }
  }
}
</script>

<style scoped lang="less">
</style>
