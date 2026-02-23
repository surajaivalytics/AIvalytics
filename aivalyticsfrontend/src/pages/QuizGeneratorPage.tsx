import React from "react";
import Layout from "../components/Layout";
import MCQGenerator from "../components/MCQGenerator";

const QuizGeneratorPage: React.FC = () => {
  return (
    <Layout>
      <MCQGenerator />
    </Layout>
  );
};

export default QuizGeneratorPage; 