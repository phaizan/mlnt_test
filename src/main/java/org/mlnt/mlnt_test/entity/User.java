package org.mlnt.mlnt_test.entity;

//TODO документацию

import lombok.Data;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
public class User {

    private int id;

    private String name;

    private String login;

    private String password;

    private int role;

}
