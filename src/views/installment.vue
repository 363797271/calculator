<template>
  <van-nav-bar title="定期复利计算器" left-text="返回" left-arrow @click-left="back" />

  <div class="main">
    <div class="form">
      <van-field
        type="number"
        label="每期支付金额"
        v-model="formData.price"
        placeholder="元"
        @input="formChange('price')"
        :error="!formValid.price.res"
        :error-message="formValid.price.msg"
      />
      <van-cell title="支付方式">
        <van-radio-group v-model="formData.type" direction="horizontal" @change="formChange('type')">
          <van-radio :name="1">月缴</van-radio>
          <van-radio :name="2">年缴</van-radio>
        </van-radio-group>
      </van-cell>
      <van-field
        type="digit"
        label="缴费期数"
        v-model="formData.count"
        :placeholder="typeText"
        @input="formChange('count')"
        :error="!formValid.count.res"
        :error-message="formValid.count.msg"
      />
      <van-field
        type="digit"
        label="冻结期数"
        v-model="formData.freezeCount"
        :placeholder="typeText"
        @input="formChange('freezeCount')"
        :error="!formValid.freezeCount.res"
        :error-message="formValid.freezeCount.msg"
      />
      <van-field
        type="number"
        label="年利率%"
        v-model="formData.rate"
        placeholder="%"
        @input="formChange('rate')"
        :error="!formValid.rate.res"
        :error-message="formValid.rate.msg"
      />
      <div class="btns">
        <van-button style="margin-right: 0.5em" type="primary" icon="add-o" size="small" @click="addItem">
          添加
        </van-button>
        <van-button style="margin-right: 0.5em" type="default" size="small" icon="replay" @click="reset">
          重置
        </van-button>
        <van-button type="danger" icon="delete" size="small" @click="clear">清空</van-button>
      </div>
    </div>
    <div class="title">
      实时数据
      <span>累计 = 满期支付 + 利息产生</span>
    </div>
    <table class="c-table">
      <thead>
        <tr>
          <th>累计</th>
          <th>满期支付</th>
          <th>总收益</th>
          <th>单期支付</th>
          <th>期数</th>
          <th>冻结</th>
          <th>年利率</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{{ dataset.totalPay ? `￥${dataset.totalPay}` : '-' }}</td>
          <td>{{ dataset.total ? `￥${dataset.total}` : '-' }}</td>
          <td>{{ dataset.interest ? `￥${dataset.interest}` : '-' }}</td>
          <td>{{ formData.price ? `￥${formData.price}` : '-' }}</td>
          <td>{{ formData.count || 0 }}{{ typeText }}</td>
          <td>{{ formData.freezeCount && formData.freezeCount > 0 ? formData.freezeCount + typeText : '-' }}</td>
          <td>{{ formData.rate || 0 }}%</td>
        </tr>
      </tbody>
    </table>
    <div class="title">添加记录</div>
    <table class="c-table">
      <thead>
        <tr>
          <th>累计</th>
          <th>满期支付</th>
          <th>总收益</th>
          <th>单期支付</th>
          <th>期数</th>
          <th>冻结</th>
          <th>年利率</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="list.length === 0"><td colspan="8" style="color: #999">无添加记录</td></tr>
        <tr v-for="(item, index) in list" :key="index">
          <td>{{ item.totalPay }}</td>
          <td>￥{{ item.total }}</td>
          <td>￥{{ item.interest }}</td>
          <td>￥{{ item.price }}</td>
          <td>{{ item.count }}{{ item.type === 1 ? '月' : '年' }}</td>
          <td>
            {{ item.freezeCount && item.freezeCount > 0 ? item.freezeCount + (item.type === 1 ? '月' : '年') : '-' }}
          </td>
          <td>{{ item.rate }}%</td>
          <td>
            <van-icon name="close" color="rgb(238, 10, 36)" @click="remove(index)" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { computed, reactive, ref } from 'vue'

// 表单
const useForm = function () {
  const formData = reactive({
    price: '',
    type: 1,
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
  const reset = () => {
    formData.price = ''
    formData.type = 1
    formData.count = ''
    formData.freezeCount = ''
    formData.rate = 2
  }
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
            formValid.count.msg = '期数至少为1'
          }
          res = false
        } else {
          formValid.count.res = true
          formValid.count.msg = ''
        }
        break
      case 'freezeCount':
        if (val < 0) {
          if (showMsg) {
            formValid.freezeCount.res = false
            formValid.freezeCount.msg = '期数不能为负数'
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

// 列表
const useList = function () {
  const list = reactive([])

  const remove = index => {
    list.splice(index, 1)
  }

  const add = item => {
    list.push(item)
  }

  const clear = () => {
    list.splice(0, list.length)
  }

  return {
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
    const listModule = useList()
    const typeText = computed(() => {
      return form.formData.type === 1 ? '月' : '年'
    })

    return {
      ...form,
      ...listModule,
      typeText,
      dataset: reactive({})
    }
  },
  methods: {
    // 返回首页
    back() {
      this.$router.go(-1)
    },
    // 保存表单
    addItem() {
      const valid = this.validate(null, true)
      if (!valid) return
      this.add(this.generateItem())
    },
    formChange(param) {
      const valid = this.validate(param, true, false)
      if (!valid) {
        this.dataset.totalPay = null
        this.dataset.total = null
        this.dataset.interest = null
      } else {
        this.generateItem()
      }
    },
    // 计算结果
    generateItem() {
      let { price, type, count, freezeCount, rate } = this.formData
      price = Number(price)
      type = Number(type)
      count = Number(count)
      freezeCount = Number(freezeCount)
      rate = Number(rate)
      let totalPay = 0 // 本金+利息累计花费
      let total = toFixed(price * count) // 满期支付
      let interest = 0
      let rateDay = rate / 100 / 365 // 天利率
      let intervalDays = type === 1 ? 365 / 12 : 365 // 单期天数
      for (let i = 1; i <= count; i++) {
        let curtInterest = toFixed(totalPay * intervalDays * rateDay)
        interest += curtInterest
        totalPay += price + curtInterest
      }
      totalPay = toFixed(totalPay)
      interest = toFixed(interest)

      // 计算冻结期
      if (freezeCount > 0) {
        for (let i = 1; i <= freezeCount; i++) {
          let curtInterest = toFixed(totalPay * intervalDays * rateDay)
          interest += curtInterest
          totalPay += curtInterest
        }
        totalPay = toFixed(totalPay)
        interest = toFixed(interest)
      }

      const res = {
        totalPay,
        total,
        interest,
        price,
        type,
        count,
        freezeCount,
        rate
      }
      this.dataset.totalPay = res.totalPay
      this.dataset.total = res.total
      this.dataset.interest = res.interest
      return res
    }
  }
}
</script>

<style scoped lang="less">
.main {
  width: 98%;
  margin: 0 auto;
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
