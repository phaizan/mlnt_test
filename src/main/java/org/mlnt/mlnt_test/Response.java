package org.mlnt.mlnt_test;

import lombok.AllArgsConstructor;
import lombok.Data;


import java.util.List;

@AllArgsConstructor
@Data
public class Response <T> {
    private String response;
    private List<T> data;
}
