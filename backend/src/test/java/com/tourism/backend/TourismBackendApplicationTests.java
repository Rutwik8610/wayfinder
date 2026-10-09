package com.tourism.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = "app.jwt.secret=test-only-key-not-used-outside-of-tests-123456789")
class TourismBackendApplicationTests {

	@Test
	void contextLoads() {
	}

}
