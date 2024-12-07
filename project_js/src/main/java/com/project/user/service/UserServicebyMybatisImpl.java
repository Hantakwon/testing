package com.project.user.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.project.mapper.UserMapper;

@Service
public class UserServicebyMybatisImpl implements UserService {

	private final UserMapper userMapper;
	
	@Autowired
	public UserServicebyMybatisImpl(UserMapper userMapper) {
		this.userMapper = userMapper;
	}	
	
	public void insertUser(UserDO userDO) {
		userMapper.insertUser(userDO);
	}

	public void updateUser(UserDO userDO) {
		userMapper.updateUser(userDO);
	}

	public void deleteUser(UserDO userDO) {
		userMapper.deleteUser(userDO.getId());
	}

	public UserDO getUser(UserDO userDO) {
		return userMapper.getUser(userDO.getId());
	}

	public List<UserDO> listUser() {
		return userMapper.getUserList();
	}
}
