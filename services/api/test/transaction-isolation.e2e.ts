import { UserEntity } from "@liexp/backend/lib/entities/User.entity.js";
import { KeywordEntity } from "@liexp/backend/lib/entities/Keyword.entity.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { describe, test, expect } from "vitest";
import { GetAppTest, type AppTest } from "./AppTest.js";

describe("Transaction Isolation Verification", () => {
  let Test: AppTest;
  
  test("Test 1: Insert data and verify it exists within transaction", async () => {
    Test = await GetAppTest();
    
    const testUserId = uuid();
    const testUsername = `transaction-test-${testUserId}@test.com`;
    
    // Insert a test user
    const user = await throwTE(
      Test.ctx.db.save(UserEntity, [{
        id: testUserId,
        username: testUsername,
        email: testUsername,
        passwordHash: "test-hash",
        firstName: "Transaction",
        lastName: "Test",
      }])
    );
    
    expect(user).toHaveLength(1);
    expect(user[0].username).toBe(testUsername);
    
    // Verify we can query it back
    const foundUser = await throwTE(
      Test.ctx.db.findOneBy(UserEntity, { id: testUserId })
    );
    
    expect(foundUser).toBeDefined();
    expect(foundUser?.username).toBe(testUsername);
    
    // Count total users
    const userCount = await throwTE(
      Test.ctx.db.count(UserEntity)
    );
    
    console.log(`✅ Test 1: Successfully inserted user. Total users in transaction: ${userCount}`);
    expect(userCount).toBeGreaterThan(0);
  });
  
  test("Test 2: Database should be clean (previous data rolled back)", async () => {
    Test = await GetAppTest();
    
    // After rollback, the user from Test 1 should NOT exist
    const userCount = await throwTE(
      Test.ctx.db.count(UserEntity)
    );
    
    console.log(`✅ Test 2: User count after rollback: ${userCount}`);
    
    // If transaction isolation is working, count should be 0
    // (or at least not include the user from Test 1)
    expect(userCount).toBe(0);
  });
  
  test("Test 3: Insert different entity type and verify", async () => {
    Test = await GetAppTest();
    
    const testKeywordId = uuid();
    const testKeywordTag = `transaction-test-${Date.now()}`;
    
    // Insert a test keyword
    const keyword = await throwTE(
      Test.ctx.db.save(KeywordEntity, [{
        id: testKeywordId,
        tag: testKeywordTag,
      }])
    );
    
    expect(keyword).toHaveLength(1);
    expect(keyword[0].tag).toBe(testKeywordTag);
    
    // Verify we can query it back
    const foundKeyword = await throwTE(
      Test.ctx.db.findOneBy(KeywordEntity, { id: testKeywordId })
    );
    
    expect(foundKeyword).toBeDefined();
    expect(foundKeyword?.tag).toBe(testKeywordTag);
    
    const keywordCount = await throwTE(
      Test.ctx.db.count(KeywordEntity)
    );
    
    console.log(`✅ Test 3: Successfully inserted keyword. Total keywords: ${keywordCount}`);
    expect(keywordCount).toBeGreaterThan(0);
  });
  
  test("Test 4: Verify keywords were rolled back", async () => {
    Test = await GetAppTest();
    
    // After rollback, the keyword from Test 3 should NOT exist
    const keywordCount = await throwTE(
      Test.ctx.db.count(KeywordEntity)
    );
    
    console.log(`✅ Test 4: Keyword count after rollback: ${keywordCount}`);
    
    // If transaction isolation is working, count should be 0
    expect(keywordCount).toBe(0);
  });
  
  test("Test 5: Complex operation with multiple inserts", async () => {
    Test = await GetAppTest();
    
    // Insert multiple entities
    const userId1 = uuid();
    const userId2 = uuid();
    
    await throwTE(
      Test.ctx.db.save(UserEntity, [
        {
          id: userId1,
          username: `user1-${userId1}@test.com`,
          email: `user1-${userId1}@test.com`,
          passwordHash: "hash1",
          firstName: "User",
          lastName: "One",
        },
        {
          id: userId2,
          username: `user2-${userId2}@test.com`,
          email: `user2-${userId2}@test.com`,
          passwordHash: "hash2",
          firstName: "User",
          lastName: "Two",
        },
      ])
    );
    
    const userCount = await throwTE(
      Test.ctx.db.count(UserEntity)
    );
    
    console.log(`✅ Test 5: Inserted multiple users. Total: ${userCount}`);
    expect(userCount).toBe(2);
  });
  
  test("Test 6: Final verification - all data rolled back", async () => {
    Test = await GetAppTest();
    
    // After all previous tests, database should be completely clean
    const userCount = await throwTE(
      Test.ctx.db.count(UserEntity)
    );
    
    const keywordCount = await throwTE(
      Test.ctx.db.count(KeywordEntity)
    );
    
    console.log(`✅ Test 6 (Final): Clean state verified. Users: ${userCount}, Keywords: ${keywordCount}`);
    
    expect(userCount).toBe(0);
    expect(keywordCount).toBe(0);
  });
});

