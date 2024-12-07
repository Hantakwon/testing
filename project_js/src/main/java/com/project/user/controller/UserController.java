package com.project.user.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.project.user.service.UserDO;
import com.project.user.service.UserService;

@Controller
public class UserController {
	
	private final UserService userService;

	@Autowired
	public UserController(UserService userService) {
		this.userService = userService;
	}
    
    @GetMapping("/")
    public String home() {
        return "index"; // 내부 경로로 전달
    }
    
	@PostMapping("/login.do")
	public String login(UserDO userDO, Model model) {
		model.addAttribute("userDO", userDO);
		return "characterInfo";	
	}
	
	@GetMapping("/signup.do")
	public String signup() {
		return "signup";
	}
	
	@PostMapping("/signup.do")
	public String signup(UserDO userDO, Model model) {
		model.addAttribute("userDO", userDO);
		
		userService.insertUser(userDO);
		return "characterInfo";			
	}
	
	@GetMapping("/game.do")
	public String game(@RequestParam(value = "characterName", required = false) String characterName, Model model) {
		System.out.println("Received Data: " + characterName);
		model.addAttribute("characterName", characterName);
		return "game";
	}
	
}
