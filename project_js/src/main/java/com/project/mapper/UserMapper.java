package com.project.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.project.user.service.UserDO;

@Mapper
public interface UserMapper {
	
	List<UserDO> getUserList();
	
	UserDO getUser(@Param("id") String id);
	
	void insertUser(UserDO userDO);

	void updateUser(UserDO userDO);
	
	void deleteUser(@Param("id") String id);
	
}
