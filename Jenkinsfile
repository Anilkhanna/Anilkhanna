pipeline {
    agent any

    environment {
        APP_NAME = 'anilkhanna'
        NODE_ENV = 'production'
        PORT = '4000'
        PATH = "/home/linuxbrew/.linuxbrew/bin:/home/linuxbrew/.linuxbrew/sbin:${env.PATH}"
    }

    triggers {
        githubPush()
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code from GitHub...'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing dependencies...'
                // Install all deps including devDependencies for build
                sh 'npm ci --include=dev'
            }
        }

        stage('Build') {
            steps {
                echo 'Building Next.js app...'
                sh 'npm run build'
            }
        }

        stage('Deploy with PM2') {
            steps {
                echo 'Deploying with PM2 from workspace...'
                sh '''
                    # Restart or start PM2 directly from workspace
                    if pm2 describe $APP_NAME > /dev/null 2>&1; then
                        echo "Restarting existing PM2 process..."
                        pm2 restart $APP_NAME
                    else
                        echo "Starting new PM2 process from workspace..."
                        pm2 start npm --name "$APP_NAME" -- start -- -p $PORT
                    fi

                    # Save PM2 process list
                    pm2 save
                '''
            }
        }
    }

    post {
        success {
            echo "✅ Deployment successful! App running at https://anilkhanna.dev"
        }
        failure {
            echo "❌ Deployment failed! Check logs above."
        }
        always {
            echo "Pipeline finished."
        }
    }
}
