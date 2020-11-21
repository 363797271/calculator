<template>
  <van-nav-bar title="分期缴费计算器" left-text="返回" left-arrow @click-left="back" />

  <div class="main">
    <div class="actions" v-show="!formVisible">
      <van-button style="margin-right: 0.5em" type="danger" icon="delete" size="small" @click="clear">清空</van-button>
      <van-button type="primary" icon="add-o" size="small" @click="toggleForm(true)">添加</van-button>
    </div>

    <div class="form" v-if="formVisible">
      <van-field
        type="number"
        label="对比金额"
        v-model="formData.base"
        placeholder="一次性支付金额（元）"
        @input="validate('base')"
        :error="!formValid.base.res"
        :error-message="formValid.base.msg"
      />
      <van-field
        type="number"
        label="每期支付金额"
        v-model="formData.price"
        placeholder="元"
        @input="validate('price')"
        :error="!formValid.price.res"
        :error-message="formValid.price.msg"
      />
      <van-cell title="支付方式">
        <van-radio-group v-model="formData.type" direction="horizontal">
          <van-radio :name="1">月缴</van-radio>
          <van-radio :name="2">年缴</van-radio>
        </van-radio-group>
      </van-cell>
      <van-field
        type="digit"
        label="期数"
        v-model="formData.count"
        :placeholder="typeText"
        @input="validate('count')"
        :error="!formValid.count.res"
        :error-message="formValid.count.msg"
      />
      <van-field
        type="number"
        label="年利率%"
        v-model="formData.rate"
        placeholder="%"
        @input="validate('rate')"
        :error="!formValid.rate.res"
        :error-message="formValid.rate.msg"
      />
      <div class="btns">
        <van-button style="margin-right: 0.5em" type="primary" size="small" @click="addItem">保存</van-button>
        <van-button type="default" size="small" @click="toggleForm(false)">取消</van-button>
      </div>
    </div>
    <van-notice-bar :scrollable="false" wrapable>对比金额差 = 满期支付 + 利息产生 - 对比金额</van-notice-bar>
    <table class="c-table">
      <thead>
        <tr>
          <th>对比金额差</th>
          <th>对比金额</th>
          <th>满期支付</th>
          <th>利息产生</th>
          <th>单期支付</th>
          <th>期数</th>
          <th>年利率</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="list.length===0"><td colspan="8" style="color:#999">请添加计算</td></tr>
        <tr v-for="(item, index) in list" :key="index">
          <td>￥{{ item.diff }}</td>
          <td>￥{{ item.base }}</td>
          <td>￥{{ item.total }}</td>
          <td>￥{{ item.interest }}</td>
          <td>￥{{ item.price }}</td>
          <td>{{ item.count }}{{ item.type === 1 ? '月' : '年' }}</td>
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
    base: '',
    price: '',
    type: 1,
    count: '',
    rate: 2
  })

  const formValid = reactive({
    base: {
      res: true,
      msg: ''
    },
    price: {
      res: true,
      msg: ''
    },
    count: {
      res: true,
      msg: ''
    },
    rate: {
      res: true,
      msg: ''
    }
  })
  const formVisible = ref(false)
  const reset = () => {
    formData.base = ''
    formData.price = ''
    formData.type = 1
    formData.count = ''
    formData.rate = 2
  }
  const toggleForm = visible => {
    if (!visible) {
      reset()
    }
    formVisible.value = visible
  }
  const validate = param => {
    let res = true
    const paramArr = ['base', 'price', 'count', 'rate']
    if (!paramArr.includes(param)) {
      // 校验全部
      paramArr.forEach(v => {
        if (!validate(v)) {
          res = false
        }
      })
    }
    const val = formData[param]
    switch (param) {
      case 'base':
        if (val <= 0) {
          formValid.base.res = false
          formValid.base.msg = '金额必须大于0'
          res = false
        } else {
          formValid.base.res = true
          formValid.base.msg = ''
        }
        break
      case 'price':
        if (val <= 0) {
          formValid.price.res = false
          formValid.price.msg = '金额必须大于0'
          res = false
        } else {
          formValid.price.res = true
          formValid.price.msg = ''
        }
        break
      case 'count':
        if (val < 1) {
          formValid.count.res = false
          formValid.count.msg = '期数至少为1'
          res = false
        } else {
          formValid.count.res = true
          formValid.count.msg = ''
        }
        break
      case 'rate':
        if (val <= 0 || val >= 100) {
          formValid.rate.res = false
          formValid.rate.msg = '范围在 0 ~ 100 之间'
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
    formVisible,
    toggleForm,
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
      typeText
    }
  },
  methods: {
    // 返回首页
    back() {
      this.$router.push({ name: 'home' })
    },
    // 保存表单
    addItem() {
      const valid = this.validate()
      if (!valid) return
      this.add(this.generateItem())
      this.toggleForm(false)
    },
    // 计算结果
    generateItem() {
      let { base, price, type, count, rate } = this.formData
      base = Number(base)
      price = Number(price)
      type = Number(type)
      count = Number(count)
      rate = Number(rate)
      let diff = 0
      let totalPay = 0 // 本金+利息累计花费
      let total = toFixed(price * count) // 满期支付
      let interest = 0
      let rateDay = rate / 100 / 365 // 天利率
      let intervalDays = type === 1 ? 365 / 12 : 365 // 单期天数
      for (let i = 1; i <= count; i++) {
        let curtInterest = toFixed(totalPay * intervalDays * rateDay)
        console.log(`${totalPay} * ${intervalDays} * ${rateDay} = ${curtInterest}`);
        interest += curtInterest
        totalPay += price + curtInterest
      }
      diff = toFixed(totalPay - base)
      totalPay = toFixed(totalPay)
      interest = toFixed(interest)
      return {
        diff,
        base,
        total,
        interest,
        price,
        type,
        count,
        rate
      }
    }
  },
}
</script>

<style scoped lang="less">
.main {
  width: 98%;
  margin: 0 auto;
}
.actions {
  text-align: right;
  margin: 1em 0;
}
.form {
  .btns {
    text-align: center;
    margin: 1em 0;
  }
}
.c-table {
  width: 100%;
  border: solid #dedede;
  border-width: 1px 1px 0 0;

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
