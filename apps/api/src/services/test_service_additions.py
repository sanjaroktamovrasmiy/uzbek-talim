    async def start_test(self, test_id: str, user: User) -> TestResponse:
        """
        Start a test for a user.
        
        Creates a TestResult record with started_at timestamp.
        
        Args:
            test_id: Test ID
            user: Current user
            
        Returns:
            Test response with questions (without correct answers)
            
        Raises:
            NotFoundError: If test not found
            ValidationError: If test already started or not available
        """
        test = await self.test_repo.get_with_questions(test_id)
        if not test:
            raise NotFoundError("Test", test_id)
        
        # Check if test is active (for students)
        if user.role == UserRole.STUDENT.value and not test.is_active:
            raise NotFoundError("Test", test_id)
        
        # Check if test result already exists (test already started)
        existing_result = await self.test_repo.session.execute(
            select(TestResult).where(
                TestResult.test_id == test_id,
                TestResult.user_id == user.id,
                TestResult.completed_at.is_(None),
            )
        )
        existing = existing_result.scalar_one_or_none()
        if existing:
            # Test already started, return the test
            if test.course_id:
                course = await self.course_repo.get_by_id(test.course_id)
                if course:
                    test.course_name = course.name
            return TestResponse.model_validate(test)
        
        # Create TestResult record
        test_result = TestResult(
            test_id=test_id,
            user_id=user.id,
            started_at=datetime.now(timezone.utc),
            max_score=test.max_score,
            answers={},
        )
        self.test_repo.session.add(test_result)
        await self.test_repo.session.flush()
        
        # Load course name
        if test.course_id:
            course = await self.course_repo.get_by_id(test.course_id)
            if course:
                test.course_name = course.name
        
        return TestResponse.model_validate(test)
    
    async def submit_test(
        self,
        test_id: str,
        user: User,
        answers: dict[str, list[str]],
    ) -> dict:
        """
        Submit test answers.
        
        Calculates score and marks test as completed.
        
        Args:
            test_id: Test ID
            user: Current user
            answers: Dictionary mapping question_id to list of option_ids or text answers
            
        Returns:
            Test result with score and percentage
            
        Raises:
            NotFoundError: If test or test result not found
        """
        test = await self.test_repo.get_with_questions(test_id)
        if not test:
            raise NotFoundError("Test", test_id)
        
        # Get or create test result
        result = await self.test_repo.session.execute(
            select(TestResult).where(
                TestResult.test_id == test_id,
                TestResult.user_id == user.id,
            )
            .order_by(TestResult.created_at.desc())
        )
        test_result = result.scalar_one_or_none()
        
        if not test_result:
            # Create new test result if not exists
            test_result = TestResult(
                test_id=test_id,
                user_id=user.id,
                started_at=datetime.now(timezone.utc),
                max_score=test.max_score,
                answers=answers,
            )
            self.test_repo.session.add(test_result)
            await self.test_repo.session.flush()
        else:
            # Update existing test result
            test_result.answers = answers
            await self.test_repo.session.flush()
        
        # Calculate score
        score = 0.0
        total_points = 0.0
        
        for question in test.questions:
            total_points += question.points
            user_answer = answers.get(question.id, [])
            
            if question.question_type == "multiple_choice":
                # Get correct option IDs
                correct_options = [
                    opt.id for opt in question.options if opt.is_correct
                ]
                # Check if all correct options are selected and no incorrect ones
                if set(user_answer) == set(correct_options) and len(user_answer) == len(correct_options):
                    score += question.points
            elif question.question_type == "single_choice":
                # Get correct option ID
                correct_option = next(
                    (opt.id for opt in question.options if opt.is_correct),
                    None,
                )
                if user_answer and user_answer[0] == correct_option:
                    score += question.points
            elif question.question_type == "text":
                # For text questions, assume they need manual grading (score = 0 for now)
                # Can be updated later by teacher
                pass
        
        # Update test result
        test_result.score = score
        test_result.percentage = (score / total_points * 100) if total_points > 0 else 0.0
        test_result.is_passed = test_result.percentage >= test.passing_score
        test_result.completed_at = datetime.now(timezone.utc)
        await self.test_repo.session.flush()
        
        return {
            "test_id": test_id,
            "score": score,
            "max_score": test.max_score,
            "percentage": test_result.percentage,
            "is_passed": test_result.is_passed,
            "completed_at": test_result.completed_at.isoformat(),
        }

