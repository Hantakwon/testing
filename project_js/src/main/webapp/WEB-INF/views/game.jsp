<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Character Info</title>
<script type="text/javascript">
	// 서버에서 전달된 characterData 값을 JavaScript 변수로 저장
	const characterName = "${characterName}"; // JSP에서 전달된 characterData 값
</script>
<link rel="stylesheet" href="/resources/css/game.css">
</head>
<body>
    <div id="container">
        <div id="info">
            <div id="hp"></div>
            <div id="level"></div>
            <div id="score"></div>
        </div>

        <div id="game">
			<img id="character">
			<div id="hitbox"></div>
        </div>
    </div>

	<!-- 외부 JavaScript 파일 로드 -->
	<script type="text/javascript" src="/resources/js/game.js"></script>

</body>
</html>
