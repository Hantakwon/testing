<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Insert title here</title>
</head>
<body>
	<h1>안녕하세요!</h1>

	<h2>로그인</h2>
		<form action="/login.do" method="POST">
			<div class="input-group">
				<label for="username">아이디:</label> <input type="text" id="id" name="id" required>
			</div>
			<div class="input-group">
				<label for="password">비밀번호:</label> <input type="password" id="password" name="password" required>
			</div>
			<button type="submit" class="login-button">로그인</button>
		</form>
	</div>
	
	<button type="button" onclick="location.href='signup.do'">회원가입</button>
</body>
</html>