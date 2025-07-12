package org.mlnt.mlnt_test.dto;

import lombok.Data;
import lombok.experimental.Accessors;

@Data
@Accessors(chain = true)
public class LoginRequest {
    private String login;
    private String password;
}
