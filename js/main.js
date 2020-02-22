
var CalculatorModal = {
  props: ['code','m_c', 'w_f_o_ce', 'w_f_o_co'],
  mounted() {
    document.getElementsByTagName("body")[0].style.overflow = 'hidden';
    this.identifySubjects();
  },
  destroyed() {
      document.getElementsByTagName("body")[0].style.overflow = 'scroll';
  },
  data () {
      return {
          merged_columns: this.m_c,
          weight_factor_of_certificate: this.w_f_o_ce,
          weight_factor_of_courses: this.w_f_o_co,
          regional_coefficient: 1.02,
          subjects: [],
          zno_results: [null,null,null],
          certificate_point: null,
          courses_point: null,
          certificate_subjects: [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null],
          final_zno: 0,
          final_certificate: 0,
          final_courses: 0,
          result: 0,
          show_zno_layer: true,
          show_certificate_layer: false,
          show_courses_layer: false,
          show_calculate_certificate: false,
          error: null,
      }
  },
  methods: {
  		identifySubjects: function () {
  			this.merged_columns.forEach((merged_column) => {
  				if(merged_column.budget_subject == merged_column.non_budgetary_subject) {
  					let subject_name = merged_column.budget_subject.split('.');
  					this.subjects.push(subject_name[1] + ' :');
  				} else {
  					let first_subject = merged_column.budget_subject.split('.');
					let second_subject = merged_column.non_budgetary_subject.split('.');
  					this.subjects.push(first_subject[1] + ' <span class="small-text">(на бюджет)</span> / ' + second_subject[1] + ' <span class="small-text">(на платне)</span> :');
  				}
  			});
  		},
  		next: function () {
  			if(this.show_certificate_layer === true) {
  				if(this.show_calculate_certificate === false){
  					let promise = new Promise((resolve, reject) => {
	  					if(this.certificate_point === null){
	  						this.error = 'Вкажіть середній бал атетсту.';
	  					} else if(this.certificate_point < 0 || this.certificate_point > 12){
	  						this.error = 'Середній бал повинен бути в межах від 0 до 12.';
	  					} else {
	  						this.error = null;
	  					}
	  					resolve();
					});
					promise.then(onFulfilled => {
					     if(this.error === null){
		  						this.show_courses_layer = true;
	  							this.show_certificate_layer = false;
		  				}
				    });
  				} else {
  					let certificate_point = 0;
  					let promise = new Promise((resolve, reject) => {
	  					for (var i = 0; i < this.certificate_subjects.length; i++) {
	  						if(this.certificate_subjects[i] === null || this.zno_results[i] === ''){
		  						this.error = 'Заповнить всі поля. Якщо полів більше, ніж кількість предметів, натисніть "видалити поле"';
		  						break;
		  					} else if(this.certificate_subjects[i] < 0 || this.certificate_subjects[i] > 12){
		  						this.error = 'Всі бали повинні бути в межах від 0 до 12.';
		  						break;
		  					}  else {
		  						certificate_point += this.certificate_subjects[i];
		  						this.error = null;
		  					}
		  					if(this.zno_results.length - 1 === i){
		  						resolve();
		  					}
	  					}
					});
					promise.then(onFulfilled => {
					     if(this.error === null){
					     	this.certificate_point = certificate_point / this.certificate_subjects.length;
		  					this.show_courses_layer = true;
	  						this.show_certificate_layer = false;
		  				}
				    });
  				}

  			} else {
  				let promise = new Promise((resolve, reject) => {
  					for (var i = 0; i < this.zno_results.length; i++) {
  						if(this.zno_results[i] === null || this.zno_results[i] === ''){
	  						this.error = 'Заповнить всі поля.';
	  						break;
	  					} else if(this.zno_results[i] < 0 || this.zno_results[i] > 100){
	  						this.error = 'Всі бали повинні бути в межах від 0 до 100.';
	  						break;
	  					}  else {
	  						this.error = null;
	  					}
	  					if(this.zno_results.length - 1 === i){
	  						resolve();
	  					}
  					}
				});
				promise.then(onFulfilled => {
				     if(this.error === null){
	  					this.show_certificate_layer = true;
	  					this.show_zno_layer = false;
	  				}
			    });
  			}
  		},
  		back: function () {
			if(this.show_certificate_layer === true) {
  				this.show_zno_layer = true;
  				this.show_certificate_layer = false;
  			} else {
  				this.show_courses_layer = false;
  				this.show_certificate_layer = true;
  			}
  		},
  		calculate: function () {
  			this.merged_columns.forEach((merged_column, key) => {
  				this.final_zno += +merged_column.weight_factor_of_subjects * this.zno_results[key];
  			});
  			this.final_certificate = +this.weight_factor_of_certificate * this.certificate_point;
  			if(this.courses_point !== null){
  				 this.final_courses = +this.weight_factor_of_courses * this.courses_point;
  			}
  			this.result = (this.final_zno + this.final_certificate + this.final_courses) * this.regional_coefficient;
  			this.result = this.result.toFixed(3);
  			this.$root.result[String(this.code)] = this.result;
  			this.$emit('close-calculator-modal');
  			this.setCookie(this.code, this.result);
  		},
  		getCookie: function (name) {
			let matches = document.cookie.match(new RegExp(
			    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
			  ));
			return matches ? decodeURIComponent(matches[1]) : undefined;
  		}, 
  		setCookie: function (code, result) {
  			document.cookie = code + '=' + result;
  		}
  },
  template: `<transition name="modal">
                <div class="modal-mask">
                    <div class="modal-wrapper">
                        <div class="modal-container modal-calculator">
                          <div class="calculator-head">
                              	 Розрахунок результуючого балу
                          </div>
                          <transition name="fade" mode="out-in">
	                          <div class="calculator-body" v-if="show_zno_layer === true" key="zno">
		                          	<div class="zno-subjects-title">
	                          			<span>Введіть результати ЗНО:</span>
	                          			<span class="small-text">(0-100, бали що надає держава не враховувати)</span>
	                          		</div>
	                          		<div class="zno-subjects">
										<div v-for="(subject, key) in this.subjects" class="subjects">
											<span v-html="subject"></span>
											<input type="text" class="point" maxlength="3" placeholder="бал" v-model.number="zno_results[key]">
										</div>
	                          		</div>
	                          		<span class="alert-error" v-show="error !== null">
			                            <strong>{{ error }}</strong>
			                        </span>
	                          		<div class="next">
										<button type="button" class="btn btn-next" @click="next()">Далі</button>
	                          		</div>
	                          </div>
	                          <div class="calculator-body" v-else-if="show_certificate_layer === true" key="certificate">
		                          	<div class="zno-subjects-title">
	                          			Середній бал атестату:
	                          		</div>
	                          		<div class="calculate-certificate">
										<button class="btn btn-certificate" @click="show_calculate_certificate = true" :style="show_calculate_certificate === true ? 'background: #f7dc6f' : ''">Порахувати</button>
										<button class="btn btn-certificate" @click="show_calculate_certificate = false" :style="show_calculate_certificate === false ? 'background: #f7dc6f' : ''">Вказати</button>
	                          		</div>
	                          		<div v-if="show_calculate_certificate" class="calculate-the-average-score">
	                          			<span>Введіть оцінки зі всіх предметів:</span>
		                          		<div class="points">
		                          			<input type="text" class="point" maxlength="2" placeholder="бал" v-for="(certificate_subject, key) in certificate_subjects" v-model.number="certificate_subjects[key]">
		                          		</div>
										<div class="calculate-certificate">
											<button class="btn btn-certificate" @click="certificate_subjects.push(null)">Додати поле</button>
											<button class="btn btn-certificate" @click="certificate_subjects.pop()">Видалити поле</button>
	                          			</div>
	                          		</div>
	                          		<div v-else class="result-certificate">
	                          			<span>Середній бал :</span>
	                          			<input type="text" class="point" maxlength="5" placeholder="бал" v-model.number="certificate_point">
	                          		</div>
	                          		<span class="alert-error" v-show="error !== null">
			                            <strong>{{ error }}</strong>
			                        </span>
	                          		<div class="next next-and-back">
	                          			<button type="button" class="btn btn-back" @click="back">Назад</button>
										<button type="button" class="btn btn-next" @click="next()">Далі</button>
	                          		</div>
	                          </div>
	                          <div class="calculator-body" v-else-if="show_courses_layer === true" key="courses">
		                          		<div class="zno-subjects-title">
	                          			<span>Бал за підготовчі курси ВНТУ:</span>
	                          			<span class="small-text">(якщо ви не закінчували підготовчі курси, просто проігноруйте цей пункт)</span>
	                          		</div>
	                          		<div class="result-certificate">
	                          			<span>Бал за підготовчі курси:</span>
	                          			<input type="text" class="point" maxlength="3" placeholder="бал" v-model.number="courses_point">
	                          		</div>
	                          		<div class="next next-and-back">
	                          			<button type="button" class="btn btn-back" @click="back">Назад</button>
										<button type="button" class="btn btn-calculate" @click="calculate()">Розрахувати</button>
	                          		</div>
	                          </div>
                          </transition>
                          <div class="close-icon close-modal" @click="$emit('close-calculator-modal')"></div>
                        </div>
                    </div>
                </div>
              </transition>
            `
}

const app = new Vue({
    el: '#app',
    components: {
     'calculator-modal': CalculatorModal,
    },
    data: {
      show_calculator_modal: false,
      show_cookie: false,
      filter_specialty: '',
      code: '',
      m_c: [],
      w_f_o_ce: '',
      w_f_o_co: '',
      result: {},
      table: [
      		{
      			specialty: "Економіка",
      			code: "051",
      			merged_columns: [
      				{
      					budget_subject: "1. Українська мова та література",
      					non_budgetary_subject: "1. Українська мова та література",
      					minimum_number_of_points: "110",
      					weight_factor_of_subjects: "0.45",
      				},{
      					budget_subject: "2. Математика",
      					non_budgetary_subject: "2. Історія України",
      					minimum_number_of_points: "110",
      					weight_factor_of_subjects: "0.2",
      				},{
      					budget_subject: "3. Іноземна мова або географія",
      					non_budgetary_subject: "3. Іноземна мова або географія",
      					minimum_number_of_points: "110",
      					weight_factor_of_subjects: "0.25",
      				}
      			], 
      			weight_factor_of_certificate: "0.1",
      			weight_factor_of_courses: "0",
      		},
      			{
      			specialty: "Менеджмент",
      			code: "051",
      			merged_columns: [
      				{
      					budget_subject: "1. Українська мова та література",
      					non_budgetary_subject: "1. Українська мова та література",
      					minimum_number_of_points: "110",
      					weight_factor_of_subjects: "0.45",
      				},{
      					budget_subject: "2. Математика",
      					non_budgetary_subject: "2. Історія України",
      					minimum_number_of_points: "110",
      					weight_factor_of_subjects: "0.2",
      				},{
      					budget_subject: "3. Фізика або іноземна мова",
      					non_budgetary_subject: "3. Фізика або Історія України",
      					minimum_number_of_points: "110",
      					weight_factor_of_subjects: "0.25",
      				}
      			], 
      			weight_factor_of_certificate: "0.1",
      			weight_factor_of_courses: "0",
      		},
      			{
      			specialty: "Маркетинг",
      			code: "071",
      			merged_columns: [
      				{
      					budget_subject: "1. Українська мова та література",
      					non_budgetary_subject: "1. Українська мова та література",
      					minimum_number_of_points: "110",
      					weight_factor_of_subjects: "0.45",
      				},{
      					budget_subject: "2. Математика",
      					non_budgetary_subject: "2. Історія України",
      					minimum_number_of_points: "110",
      					weight_factor_of_subjects: "0.2",
      				},{
      					budget_subject: "3. Іноземна мова або географія",
      					non_budgetary_subject: "3. Іноземна мова або географія",
      					minimum_number_of_points: "110",
      					weight_factor_of_subjects: "0.25",
      				}
      			], 
      			weight_factor_of_certificate: "0.1",
      			weight_factor_of_courses: "0",
      		},
      			{
      			specialty: "Підприємництво, торгівля та біржова діяльність",
      			code: "051",
      			merged_columns: [
      				{
      					budget_subject: "1. Українська мова та література",
      					non_budgetary_subject: "1. Українська мова та література",
      					minimum_number_of_points: "110",
      					weight_factor_of_subjects: "0.45",
      				},{
      					budget_subject: "2. Математика",
      					non_budgetary_subject: "2. Історія України",
      					minimum_number_of_points: "110",
      					weight_factor_of_subjects: "0.2",
      				},{
      					budget_subject: "3. Іноземна мова або географія",
      					non_budgetary_subject: "3. Іноземна мова або географія",
      					minimum_number_of_points: "110",
      					weight_factor_of_subjects: "0.25",
      				}
      			], 
      			weight_factor_of_certificate: "0.1",
      			weight_factor_of_courses: "0",
      		},
      			{
      			specialty: "Економіка",
      			code: "031",
      			merged_columns: [
      				{
      					budget_subject: "1. Українська мова та література",
      					non_budgetary_subject: "1. Українська мова та література",
      					minimum_number_of_points: "110",
      					weight_factor_of_subjects: "0.45",
      				},{
      					budget_subject: "2. Математика",
      					non_budgetary_subject: "2. Історія України",
      					minimum_number_of_points: "110",
      					weight_factor_of_subjects: "0.2",
      				},{
      					budget_subject: "3. Іноземна мова або географія",
      					non_budgetary_subject: "3. Іноземна мова або географія",
      					minimum_number_of_points: "110",
      					weight_factor_of_subjects: "0.25",
      				}
      			], 
      			weight_factor_of_certificate: "0.1",
      			weight_factor_of_courses: "0",
      		},
      			{
      			specialty: "Економіка",
      			code: "051",
      			merged_columns: [
      				{
      					budget_subject: "1. Українська мова та література",
      					non_budgetary_subject: "1. Українська мова та література",
      					minimum_number_of_points: "110",
      					weight_factor_of_subjects: "0.45",
      				},{
      					budget_subject: "2. Математика",
      					non_budgetary_subject: "2. Історія України",
      					minimum_number_of_points: "110",
      					weight_factor_of_subjects: "0.2",
      				},{
      					budget_subject: "3. Іноземна мова або географія",
      					non_budgetary_subject: "3. Іноземна мова або географія",
      					minimum_number_of_points: "110",
      					weight_factor_of_subjects: "0.25",
      				}
      			], 
      			weight_factor_of_certificate: "0.1",
      			weight_factor_of_courses: "0",
      		}
      ],
    },
    created() {
  		this.table.forEach((row) => {
  			let cookie = this.getCookie(row.code);
  			if(cookie !== undefined){
  				this.result[row.code] = cookie;
  			} else {
  				this.result[row.code] = null;
  			}
  		});
  		this.cookieIsSet();
  	},
    computed: {
        filteredTable: function() {
            return this.table.filter(row => {
                return row.specialty.toLowerCase().indexOf(this.filter_specialty.toLowerCase()) !== -1;
            });
        }
    },
    methods: {
    	setValues: function(code, merged_columns, weight_factor_of_certificate, weight_factor_of_courses) {
    		this.code = code;
    		this.m_c = merged_columns;
    		this.w_f_o_ce = weight_factor_of_certificate;
    		this.w_f_o_co = weight_factor_of_courses;
    		this.show_calculator_modal = !this.show_calculator_modal;
    	},
    	cookieIsSet: function () {
			let result = this.getCookie('coockie');
			result !== 'confirmed' ? this.show_cookie = true : this.show_cookie = false;
  		},
  		getCookie: function (name) {
			let matches = document.cookie.match(new RegExp(
			    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
			  ));
			return matches ? decodeURIComponent(matches[1]) : undefined;
  		},
  		confirmUsingCookie: function () {
			document.cookie = 'coockie=confirmed;expires=' + (new Date).getTime() + (2 * 365 * 24 * 60 * 60 * 1000);
			this.show_cookie = false;
  		}

    }

});
