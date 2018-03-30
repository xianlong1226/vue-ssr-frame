<template>
	<div class="app_index">
    <p>I am index</p>
		<p>{{ count1 }}</p>
    <button v-on:click="increment">add</button>
    <button v-on:click="decrement">dec</button>
	</div>
</template>

<script>
	export default {
		data() {
			return { //初始化数据模型
				count1: 1
			}
		},
		computed: { //计算属性，当一个数据 需要计算 并实时根据data中数据不断变化时  使用。 
			count () {
				return 0 // this.$store.state.count
			}
		},
		created() {
			console.log('success')
		},
		mounted() { //生命周期函数 改函数下 可获取DOM
			
		},
		methods: { //所有的 交互操作 例如：click ，mouseover等 写在此对象下
			getData(){
				$.ajax({ 
					'url': '/test', 
					'method': 'get', 
					'success': function(result) {
						console.log(result)
					}
				})
      },
			increment () {
				// this.$store.commit('increment', 2)
        this.count1++;
			},
			decrement () {
				// this.$store.commit('decrement', 3)
        this.count1--;
			}
		},
		filters: {
			
		},
		components: { //注册组件 以便引用
		}
	}
</script>

<style lang="less">
	@font-face {
		font-family: 'transformericon-font';
		src: url('../../fonts/transformericon.eot');
		src: url('../../fonts/transformericon.eot?#iefix') format('embedded-opentype'), url('../../fonts/transformericon.ttf') format('truetype'), url('../../fonts/transformericon.woff') format('woff'), url('../../fonts/transformericon.svg#icons-font') format('svg');
		font-weight: normal;
		font-style: normal;
	}

	.app_index {
		color: green;
		height: 300px;
		font-family: 'transformericon-font';
    background: #eee url('./images/bg.jpg') no-repeat;
	}
</style>