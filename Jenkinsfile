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

        stage('Create .env') {
            steps {
                echo 'Creating .env file...'
                withCredentials([
                    string(credentialsId: 'ADMIN_PASSWORD', variable: 'ADMIN_PASSWORD'),
                    string(credentialsId: 'CRON_SECRET', variable: 'CRON_SECRET'),
                    string(credentialsId: 'PORTFOLIO_DATABASE_URL', variable: 'PORTFOLIO_DATABASE_URL'),
                    string(credentialsId: 'RAPIDAPI_KEY', variable: 'RAPIDAPI_KEY')
                ]) {
                    sh '''
                        cat > .env << ENVEOF
NODE_ENV=production
ADMIN_PASSWORD=${ADMIN_PASSWORD}
CRON_SECRET=${CRON_SECRET}
DATABASE_URL=${PORTFOLIO_DATABASE_URL}
RAPIDAPI_KEY=${RAPIDAPI_KEY}
ENVEOF
                    '''
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing dependencies...'
                sh 'npm ci --include=dev'
            }
        }

        stage('Build') {
            steps {
                echo 'Building Next.js app...'
                sh 'npm run build'
            }
        }

        stage('Fix Permissions') {
            steps {
                echo 'Setting file permissions...'
                sh 'chmod -R 777 src/data/'
            }
        }

        stage('Deploy with PM2') {
            steps {
                echo 'Deploying with PM2...'
                sh '''
                    if sudo -u anil pm2 describe $APP_NAME > /dev/null 2>&1; then
                        echo "Restarting existing PM2 process..."
                        sudo -u anil pm2 restart $APP_NAME
                    else
                        echo "Starting new PM2 process..."
                        sudo -u anil pm2 start npm --name "$APP_NAME" -- start -- -p $PORT
                    fi
                    sudo -u anil pm2 save
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
