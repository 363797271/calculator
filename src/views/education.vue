<template>
  <van-nav-bar title="教育金年复利" left-text="返回" left-arrow @click-left="back" />
  <div class="main">
    <div class="form">
      <van-field
        type="number"
        label="每年支付金额"
        v-model="formData.price"
        placeholder="元"
        @input="formChange('price')"
        :error="!formValid.price.res"
        :error-message="formValid.price.msg"
      />
      <van-field
        type="digit"
        label="缴费年数"
        v-model="formData.count"
        placeholder="年"
        @input="formChange('count')"
        :error="!formValid.count.res"
        :error-message="formValid.count.msg"
      />
      <van-field
        type="digit"
        label="冻结期数"
        v-model="formData.freezeCount"
        placeholder="年"
        @input="formChange('freezeCount')"
        :error="!formValid.freezeCount.res"
        :error-message="formValid.freezeCount.msg"
      />

      <div class="form-title">教育金领取规则</div>

      <van-field
        type="number"
        label="领取金额"
        v-model="receiveFormData.price"
        placeholder="元"
        @input="formChange('price', true)"
        :error="!receiveFormValid.price.res"
        :error-message="receiveFormValid.price.msg"
      />
      <van-field
        type="digit"
        label="第几年领取"
        v-model="receiveFormData.year"
        placeholder="年"
        @input="formChange('year', true)"
        :error="!receiveFormValid.year.res"
        :error-message="receiveFormValid.year.msg"
      />
      <div class="btns">
        <van-button style="margin-right: 0.5em" type="primary" icon="add-o" size="small" @click="add">添加</van-button>
        <van-button type="danger" icon="delete" size="small" @click="clear">清空</van-button>
      </div>
    </div>
    <div class="title">领取规则</div>
    <table class="c-table">
      <thead>
        <tr>
          <th>领取金额</th>
          <th>第几年领取</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in list" :key="index">
          <td>{{ `￥${item.price}` }}</td>
          <td>{{ item.year }}</td>
          <td>
            <van-icon name="close" color="rgb(238, 10, 36)" @click="remove(index)" />
          </td>
        </tr>
      </tbody>
    </table>
    <div class="form-title">调整利率</div>
    <van-field
      type="number"
      label="年利率%"
      v-model="formData.rate"
      placeholder="%"
      @input="formChange('rate')"
      :error="!formValid.rate.res"
      :error-message="formValid.rate.msg"
    />
    <div class="title">满期领取总额对比结果</div>
    <table class="c-table" style="margin-bottom: 40px">
      <thead>
        <tr>
          <th>自主理财</th>
          <th>教育金</th>
          <th>差额</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{{ dataset.self ? `￥${dataset.self}` : '-' }}</td>
          <td>{{ dataset.product ? `￥${dataset.product}` : '-' }}</td>
          <td>{{ dataset.total ? `￥${dataset.total}` : '-' }}</td>
        </tr>
      </tbody>
    </table>

    <div class="info">
      <hr>
      <h4>表单说明：</h4>
      <p>缴费年数：保单缴费的年数</p>
      <p>冻结期数：满期领取的岁数 - 缴费年数 - 投保时的岁数</p>
      <p>第几年领取：领取时的岁数 + 1 - 投保时的岁数</p>
      <hr>
      <h4>举例：</h4>
      <p>0岁的生日起存，缴1年，冻结1年，也就是1(1+1-1)岁的第一天/生日的时候可以领，存了1年，有1年的收益</p>
      <p>0岁的生日起存，缴2年，冻结1年，也就是2(2+1-1)岁的第一天/生日的时候可以领，第一次存的钱，1年后（1岁）本息取出，加上第二次的钱又存了进去，等待（冻结）了1年，全部取出，此时2岁</p>
      <p>0岁的生日起存，缴10年，冻结21年，也就是30(21+10-1)岁的第一天/生日的时候可以领</p>
      <p>教育金第1年领，也就是0岁的第一天/生日的时候领，等于第一笔钱存的时候就领取了一笔钱</p>
      <p>0岁的生日起存，缴10年，冻结21年，第11年领，也就是10（11-1）岁的时候领，到满期可以存定期20（21+10-1-(11-1)）年</p>
      <p>0岁的生日起存，缴10年，冻结21年，第31年领，也就是30（31-1）岁的时候领，到满期可以存定期0（21+10-31）年</p>
      <h4>复利的期数举例：</h4>
      <p>复利指的是存一笔钱，每年取出本息再全部存起来</p>
      <p>可以设置缴费年数=1，冻结期数=复利期数，来计算</p>
      <p>例如，现在10岁开始存一笔钱，存20岁后取出，实际存了10年（20-10），复利期数=20，缴费年数=1，冻结期数=19</p>
    </div>
  </div>
</template>

<script>
import { computed, reactive, ref } from 'vue'

// 表单
const useForm = function () {
  const formData = reactive({
    price: '',
    count: '',
    freezeCount: '',
    rate: 2
  })

  const formValid = reactive({
    price: {
      res: true,
      msg: ''
    },
    count: {
      res: true,
      msg: ''
    },
    freezeCount: {
      res: true,
      msg: ''
    },
    rate: {
      res: true,
      msg: ''
    }
  })
  const validate = (param, validAll = false, showMsg = true) => {
    let res = true
    const paramArr = ['price', 'count', 'freezeCount', 'rate']
    if (validAll) {
      // 校验全部
      paramArr.forEach(v => {
        if (!validate(v, false, showMsg || (!showMsg && param === v))) {
          res = false
        }
      })
    }
    const val = formData[param]
    switch (param) {
      case 'price':
        if (val <= 0) {
          if (showMsg) {
            formValid.price.res = false
            formValid.price.msg = '金额必须大于0'
          }
          res = false
        } else {
          formValid.price.res = true
          formValid.price.msg = ''
        }
        break
      case 'count':
        if (val < 1) {
          if (showMsg) {
            formValid.count.res = false
            formValid.count.msg = '至少为1'
          }
          res = false
        } else {
          formValid.count.res = true
          formValid.count.msg = ''
        }
        break
      case 'freezeCount':
        if (val < 1) {
          if (showMsg) {
            formValid.freezeCount.res = false
            formValid.freezeCount.msg = '至少为1'
          }
          res = false
        } else {
          formValid.freezeCount.res = true
          formValid.freezeCount.msg = ''
        }
        break
      case 'rate':
        if (val <= 0 || val >= 100) {
          if (showMsg) {
            formValid.rate.res = false
            formValid.rate.msg = '范围在 0 ~ 100 之间'
          }
          res = false
        } else {
          formValid.rate.res = true
          formValid.rate.msg = ''
        }
        break
    }
    return res
  }
  return {
    formData,
    formValid,
    validate
  }
}

// 领取
const useReceive = function () {
  const formData = reactive({
    price: '',
    year: ''
  })

  const formValid = reactive({
    price: {
      res: true,
      msg: ''
    },
    year: {
      res: true,
      msg: ''
    }
  })
  const validate = (param, validAll = false, showMsg = true) => {
    let res = true
    const paramArr = ['price', 'year']
    if (validAll) {
      // 校验全部
      paramArr.forEach(v => {
        if (!validate(v, false, showMsg || (!showMsg && param === v))) {
          res = false
        }
      })
    }
    const val = formData[param]
    switch (param) {
      case 'price':
        if (val <= 0) {
          if (showMsg) {
            formValid.price.res = false
            formValid.price.msg = '金额必须大于0'
          }
          res = false
        } else {
          formValid.price.res = true
          formValid.price.msg = ''
        }
        break
      case 'year':
        if (val < 1) {
          if (showMsg) {
            formValid.year.res = false
            formValid.year.msg = '至少为1'
          }
          res = false
        } else {
          formValid.year.res = true
          formValid.year.msg = ''
        }
        break
    }
    return res
  }

  const list = reactive([])

  const remove = index => {
    list.splice(index, 1)
  }

  const add = () => {
    const valid = validate(null, true)
    if (!valid) return
    list.push({ ...formData })
  }

  const clear = () => {
    list.splice(0, list.length)
  }

  return {
    receiveFormData: formData,
    receiveFormValid: formValid,
    receiveValidate: validate,
    list,
    remove,
    add,
    clear
  }
}

// 保留两位小数
const toFixed = num => {
  return Number(Number(num).toFixed(2))
}

export default {
  setup() {
    const form = useForm()
    const receiveModule = useReceive()

    return {
      ...form,
      ...receiveModule,
      dataset: reactive({
        self: 0,
        product: 0
      })
    }
  },
  computed: {
    diff() {
      if (this.dataset.self !== null && this.dataset.product !== null) {
        return toFixed(this.dataset.self - this.dataset.product)
      }
    }
  },
  watch: {
    list: {
      deep: true,
      handler() {
        this.generate()
      }
    }
  },
  methods: {
    // 返回首页
    back() {
      this.$router.go(-1)
    },
    formChange(param, isReceive = false) {
      const valid = !isReceive ? this.validate(param, true, false) : this.receiveValidate(param, true, false)
      if (!valid) {
        if (!isReceive) {
          this.dataset.self = null
          this.dataset.product = null
        }
      } else {
        this.generate()
      }
    },
    // 计算结果
    generate() {
      let { price, type, count, freezeCount, rate } = this.formData
      price = Number(price)
      count = Number(count)
      freezeCount = Number(freezeCount)
      rate = Number(rate) / 100
      // 计算自主理财
      let totalPay = this.compound(price, count, rate, false) // 本金+利息累计花费

      // 计算冻结期
      if (freezeCount > 0) {
        totalPay = this.compound(totalPay, freezeCount, rate)
      }
      this.dataset.self = totalPay

      // 计算教育金
      let receiveTotal = 0
      let allCount = count + freezeCount
      this.list.forEach((v, i) => {
        let { price, year } = v
        price = Number(price)
        year = Number(year)
        receiveTotal += this.compound(price, allCount - year - 1, rate)
      })
      this.dataset.product = Number(toFixed(receiveTotal))
    },
    // 复利计算
    // isOnetime 是否一次性缴还是每次都缴
    compound(price, count, rate, isOnetime = true) {
      console.log(3);
      let totalPay = price // 本金+利息累计花费
      let times = isOnetime ? count : count - 1
      for (let i = 1; i <= times; i++) {
        console.log('each:',i);
        // 如果不是一次性缴费，就每次都增加
        let curtInterest = totalPay * rate
        totalPay += curtInterest
        if (!isOnetime) {
          totalPay += price
        }
      }
      totalPay = Number(toFixed(totalPay))

      console.log(4);
      return totalPay
    }
  }
}
</script>

<style scoped lang="less">
.main {
  width: 98%;
  margin: 0 auto;
}
.form-title {
  margin: 0;
  padding: 20px 16px 16px;
  color: rgba(69, 90, 100, 0.6);
  font-size: 14px;
  line-height: 16px;
  text-align: center;
}
.title {
  font-size: 14px;
  font-weight: bold;
  margin: 10px 0;
  & > span {
    font-weight: normal;
    font-size: 12px;
    float: right;
    color: #666;
  }
}
.form {
  .btns {
    text-align: center;
    margin: 1em 0;
  }
}
.c-table {
  width: 100%;
  max-width: 100%;
  border: solid #dedede;
  border-width: 1px 1px 0 0;
  border-collapse: collapse;
  th,
  td {
    border: solid #dedede;
    border-width: 0 0 1px 1px;
    padding: 0.5em 0.2em;
    text-align: center;
  }

  td {
    color: #666;
  }
}
</style>
