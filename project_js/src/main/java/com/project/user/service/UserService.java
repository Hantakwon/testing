package com.project.user.service;

import java.util.List;

public interface UserService {
	
	void insertUser(UserDO userDO);
	
	void updateUser(UserDO userDO);
	
	void deleteUser(UserDO userDO);
	
	UserDO getUser(UserDO userDO);
	
	List<UserDO> listUser();
	
}

