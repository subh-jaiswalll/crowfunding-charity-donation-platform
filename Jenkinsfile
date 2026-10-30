
pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                echo 'Pulling CrowFunding project from GitHub'
            }
        }

        stage('Verify Project') {
            steps {
                sh 'pwd'
                sh 'ls -la'
                echo 'CrowFunding source code is available!'
            }
        }
    }
}
