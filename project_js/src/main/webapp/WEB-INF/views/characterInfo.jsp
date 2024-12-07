<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Character Info</title>
<link rel="stylesheet" href="/resources/css/characterInfo.css">
</head>
<body>
	<div id="container">

		<div id="detail">
			<div id="detailImgContainer">
				<img id="detailImg" alt="캐릭터 이미지">
			</div>
			<div id="detailInfo">
				<h1 id="detailName"></h1>
				<p id="detailDescription"></p>
				<button id="startBtn">게임 시작</button>
			</div>
		</div>

		<div id="characterContainer">
			<!-- 전사 캐릭터 정보 -->
			<div class="character">
				<img id="warriorImage">
				<h1 id="warriorName"></h1>
				<p id="warriorDescription"></p>
			</div>

			<!-- 궁수 캐릭터 정보 -->
			<div class="character">
				<img id="archerImage">
				<h1 id="archerName"></h1>
				<p id="archerDescription"></p>
			</div>

			<!-- 법사 캐릭터 정보 -->
			<div class="character">
				<img id="magicianImage">
				<h1 id="magicianName"></h1>
				<p id="magicianDescription"></p>
			</div>

			<!-- 도적 캐릭터 정보 -->
			<div class="character">
				<img id="thiefImage">
				<h1 id="thiefName"></h1>
				<p id="thiefDescription"></p>
			</div>
		</div>
	</div>

	<script type="text/javascript" src="/resources/js/characterInfo.js"></script>
</body>
</html>
