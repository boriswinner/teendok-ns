<template>
	<Page>
		<FlexboxLayout class="page">
			<StackLayout class="form">
				<Label class="header" text="TEENDOK" />

				<StackLayout class="input-field" marginBottom="25">
					<TextField class="input" hint="Эл. почта" keyboardType="email" autocorrect="false" autocapitalizationType="none" v-model="user.email"
					 returnKeyType="next" @returnPress="focusPassword" fontSize="18" />
					<StackLayout class="hr-light" />
				</StackLayout>

				<StackLayout class="input-field" marginBottom="25">
					<TextField ref="password" class="input" hint="Пароль" secure="true" v-model="user.password" :returnKeyType="isLoggingIn ? 'done' : 'next'"
					 @returnPress="focusConfirmPassword" fontSize="18" />
					<StackLayout class="hr-light" />
				</StackLayout>

				<StackLayout v-show="!isLoggingIn" class="input-field">
					<TextField ref="confirmPassword" class="input" hint="Подтвердите пароль" secure="true" v-model="user.confirmPassword" returnKeyType="done"
					 fontSize="18" />
					<StackLayout class="hr-light" />
				</StackLayout>

				<Button :text="isLoggingIn ? 'Войти' : 'Зарегистрироваться'" @tap="submit" class="btn btn-primary m-t-20" />
			</StackLayout>

			<Label class="login-label sign-up-label" @tap="toggleForm">
	          <FormattedString>
	            <Span :text="isLoggingIn ? 'Нет аккаунта? ' : 'Назад ко входу'" />
	            <Span :text="isLoggingIn ? 'Зарегистрируйтесь!' : ''" class="bold" />
	          </FormattedString>
	        </Label>
		</FlexboxLayout>
	</Page>
</template>
<script>
import App from '@/components/App'
// A stub for a service that authenticates users.
import firebase from "nativescript-plugin-firebase";
const userService = {
  async register(user) {
    return await firebase.createUser({
      email: user.email,
      password: user.password
    });
  },
  async login(user) {
    return await firebase.login({
      type: firebase.LoginType.PASSWORD,
      passwordOptions: {
        email: user.email,
        password: user.password
      }
    });
  },
  async resetPassword(email) {
    return await firebase.resetPassword({
      email: email
    });
  },
};

var LoadingIndicator = require("nativescript-loading-indicator")
  .LoadingIndicator;
var loader = new LoadingIndicator();
export default {
  components: {
    App,
  },  
  data() {
    return {
      isLoggingIn: true,
      user: {
        email: 'boriswinner88@gmail.com',
        password: 'Hahahaha1',
        confirmPassword: null
      }
    };
  },
  methods: {
    toggleForm() {
      this.isLoggingIn = !this.isLoggingIn;
    },
    submit() {
      if (!this.user.email || !this.user.password) {
        this.alert("Введите почту и пароль.");
        return;
      }
      loader.show();
      if (this.isLoggingIn) {
        this.login();
      } else {
        this.register();
      }
    },
    login() {
      userService
        .login(this.user)
        .then(() => {
      let vi = this
      firebase.getAuthToken({
        // default false, not recommended to set to true by Firebase but exposed for {N} devs nonetheless :)
        forceRefresh: false
      }).then(
          function (result) {
            vi.$store.commit('setFirebaseToken', result.token)   
            loader.hide();
            vi.$navigateTo(App);        
          },
          function (errorMessage) {
            console.log("Auth result retrieval error: " + errorMessage);
          }
      );      		    
        })
        .catch(err => {
          console.error(err);
          loader.hide();          
          if (err.includes('InvalidUser')){
            this.alert('Некорректные данные учётной записи!')
          } else {
            this.alert(err);            
          }
        });
    },
    register() {
      var validator = require("email-validator");
      if (!validator.validate(this.user.email)) {
        loader.hide();
        this.alert("Пожалуйста, введите действительный адрес электронной почты");
        return;
      }
      if (this.user.password != this.user.confirmPassword) {
        loader.hide();
		this.alert("Ваши пароли не совпадают");
        return;
      }
      if (this.user.password.length < 6) {
        loader.hide();
		this.alert("Пароль должен быть от 6 символов");
        return;
      }
      userService
        .register(this.user)
        .then(() => {
          loader.hide();
		  this.alert("Учётная запись успешно создана!");
          this.isLoggingIn = true;
        })
        .catch(err => {
          console.error(err);
          loader.hide();
          this.alert(err);
        });
    },
    focusPassword() {
      this.$refs.password.nativeView.focus();
    },
    focusConfirmPassword() {
      if (!this.isLoggingIn) {
        this.$refs.confirmPassword.nativeView.focus();
      }
    },
    alert(message) {
      return alert({
        title: "TEENDOK",
        okButtonText: "OK",
        message: message
      });
    }
  }
};

</script>
	
<style scoped>
	.page {
		align-items: center;
		flex-direction: column;
	}

	.form {
		margin-left: 30;
		margin-right: 30;
		flex-grow: 2;
		vertical-align: middle;
	}

	.logo {
		margin-bottom: 12;
		height: 90;
		font-weight: bold;
	}

	.header {
		horizontal-align: center;
		font-size: 25;
		font-weight: 600;
		margin-bottom: 70;
		text-align: center;
		color: #53ba82;
	}

	.input-field {
		margin-bottom: 25;
	}

	.input {
		font-size: 18;
		placeholder-color: #A8A8A8;
	}

	.input-field .input {
		font-size: 54;
	}

	.btn-primary {
		height: 50;
		margin: 30 5 15 5;
		background-color: #D51A1A;
		border-radius: 5;
		font-size: 20;
		font-weight: 600;
	}

	.login-label {
		horizontal-align: center;
		color: #A8A8A8;
		font-size: 16;
	}

	.sign-up-label {
		margin-bottom: 20;
	}

	.bold {
		color: #000000;
	}
</style>
